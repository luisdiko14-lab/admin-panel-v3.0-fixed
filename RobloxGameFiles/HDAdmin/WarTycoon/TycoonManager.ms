-- War Tycoon Manager Module
-- Tycoon Management System for HD Admin
-- Module Script (.ms)

local TycoonManager = {}
TycoonManager.__index = TycoonManager

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

-- Data Store
local TycoonDataStore = DataStoreService:GetDataStore("WarTycoon_TycoonData")

-- Tycoon data cache
TycoonManager.Tycoons = {}
TycoonManager.PlayerTycoons = {}

-- Resource configuration
TycoonManager.ResourceConfig = {
    Crystals = {
        StartAmount = 500,
        MaxAmount = 999999,
        Icon = "💎",
        Color = Color3.fromRGB(128, 0, 128)
    },
    Oil = {
        StartAmount = 200,
        MaxAmount = 999999,
        Icon = "🛢️",
        Color = Color3.fromRGB(139, 69, 19)
    },
    Steel = {
        StartAmount = 100,
        MaxAmount = 999999,
        Icon = "⚙️",
        Color = Color3.fromRGB(169, 169, 169)
    },
    Energy = {
        StartAmount = 300,
        MaxAmount = 999999,
        Icon = "⚡",
        Color = Color3.fromRGB(255, 255, 0)
    }
}

-- Tycoon levels and upgrades
TycoonManager.LevelConfig = {
    [1] = {
        Name = "Outpost",
        RequiredResources = {},
        ProductionRate = 1,
        MaxBuildings = 5
    },
    [2] = {
        Name = "Base",
        RequiredResources = {Crystals = 1000, Steel = 500},
        ProductionRate = 1.5,
        MaxBuildings = 10
    },
    [3] = {
        Name = "Fortress",
        RequiredResources = {Crystals = 5000, Steel = 2500, Oil = 1000},
        ProductionRate = 2.0,
        MaxBuildings = 15
    },
    [4] = {
        Name = "Empire",
        RequiredResources = {Crystals = 25000, Steel = 10000, Oil = 5000, Energy = 2500},
        ProductionRate = 3.0,
        MaxBuildings = 25
    },
    [5] = {
        Name = "Superpower",
        RequiredResources = {Crystals = 100000, Steel = 50000, Oil = 25000, Energy = 15000},
        ProductionRate = 5.0,
        MaxBuildings = 50
    }
}

function TycoonManager:Init()
    print("[War Tycoon] Tycoon Manager initialized")
    
    -- Connect player events
    Players.PlayerAdded:Connect(function(player)
        self:OnPlayerJoined(player)
    end)
    
    Players.PlayerRemoving:Connect(function(player)
        self:OnPlayerLeaving(player)
    end)
    
    -- Start resource production loop
    self:StartProductionLoop()
    
    -- Auto-save tycoons
    spawn(function()
        while true do
            wait(60) -- Save every minute
            self:SaveAllTycoons()
        end
    end)
end

function TycoonManager:OnPlayerJoined(player)
    -- Load or create player tycoon
    local tycoonData = self:LoadTycoonData(player)
    if not tycoonData then
        tycoonData = self:CreateDefaultTycoon(player)
    end
    
    -- Cache tycoon data
    self.PlayerTycoons[player.UserId] = tycoonData
    
    -- Setup tycoon in workspace if needed
    self:SetupTycoonInWorkspace(player, tycoonData)
    
    -- Update leaderstats
    self:UpdateLeaderstats(player, tycoonData)
end

function TycoonManager:OnPlayerLeaving(player)
    -- Save tycoon data
    local tycoonData = self.PlayerTycoons[player.UserId]
    if tycoonData then
        self:SaveTycoonData(player, tycoonData)
        self.PlayerTycoons[player.UserId] = nil
    end
end

function TycoonManager:LoadTycoonData(player)
    local success, data = pcall(function()
        return TycoonDataStore:GetAsync(tostring(player.UserId))
    end)
    
    if success and data then
        return data
    end
    
    return nil
end

function TycoonManager:CreateDefaultTycoon(player)
    return {
        UserId = player.UserId,
        PlayerName = player.Name,
        Level = 1,
        LevelName = "Outpost",
        Resources = {
            Crystals = self.ResourceConfig.Crystals.StartAmount,
            Oil = self.ResourceConfig.Oil.StartAmount,
            Steel = self.ResourceConfig.Steel.StartAmount,
            Energy = self.ResourceConfig.Energy.StartAmount
        },
        Buildings = {},
        ProductionRate = 1.0,
        LastProduction = tick(),
        IsActive = true,
        Position = nil, -- Will be set when placed in workspace
        
        -- Statistics
        Stats = {
            TotalResourcesProduced = 0,
            PlayTime = 0,
            Upgrades = 0,
            CreatedAt = os.time()
        }
    }
end

function TycoonManager:SaveTycoonData(player, tycoonData)
    if not tycoonData then return false end
    
    -- Update last save time
    tycoonData.LastSaved = os.time()
    tycoonData.PlayerName = player.Name
    
    local success = pcall(function()
        TycoonDataStore:SetAsync(tostring(player.UserId), tycoonData)
    end)
    
    if success then
        print("[War Tycoon] Saved tycoon for:", player.Name)
        return true
    else
        warn("[War Tycoon] Failed to save tycoon for:", player.Name)
        return false
    end
end

function TycoonManager:SetupTycoonInWorkspace(player, tycoonData)
    -- Find or create tycoon plot in workspace
    local tycoonPlots = game.Workspace:FindFirstChild("TycoonPlots")
    if not tycoonPlots then
        tycoonPlots = Instance.new("Folder")
        tycoonPlots.Name = "TycoonPlots"
        tycoonPlots.Parent = game.Workspace
    end
    
    -- Create player's tycoon plot
    local playerPlot = tycoonPlots:FindFirstChild("Plot_" .. player.UserId)
    if not playerPlot then
        playerPlot = self:CreateTycoonPlot(player, tycoonData)
    end
    
    -- Update tycoon visuals based on level
    self:UpdateTycoonVisuals(playerPlot, tycoonData)
end

function TycoonManager:CreateTycoonPlot(player, tycoonData)
    local plot = Instance.new("Model")
    plot.Name = "Plot_" .. player.UserId
    plot.Parent = game.Workspace.TycoonPlots
    
    -- Base platform
    local basePart = Instance.new("Part")
    basePart.Name = "Base"
    basePart.Size = Vector3.new(50, 1, 50)
    basePart.Position = self:GetNextPlotPosition()
    basePart.Anchored = true
    basePart.BrickColor = BrickColor.new("Dark green")
    basePart.Material = Enum.Material.Grass
    basePart.Parent = plot
    
    -- Plot owner sign
    local sign = Instance.new("Part")
    sign.Name = "OwnerSign"
    sign.Size = Vector3.new(8, 6, 1)
    sign.Position = basePart.Position + Vector3.new(0, 4, 20)
    sign.Anchored = true
    sign.BrickColor = BrickColor.new("Really black")
    sign.Parent = plot
    
    local signGui = Instance.new("SurfaceGui")
    signGui.Parent = sign
    
    local signText = Instance.new("TextLabel")
    signText.Size = UDim2.new(1, 0, 1, 0)
    signText.Text = player.Name .. "'s\n" .. tycoonData.LevelName
    signText.TextColor3 = Color3.new(1, 1, 1)
    signText.TextScaled = true
    signText.BackgroundTransparency = 1
    signText.Font = Enum.Font.SourceSansBold
    signText.Parent = signGui
    
    -- Save position
    tycoonData.Position = basePart.Position
    
    return plot
end

function TycoonManager:GetNextPlotPosition()
    local plotCount = #game.Workspace.TycoonPlots:GetChildren()
    local spacing = 100
    local plotsPerRow = 10
    
    local row = math.floor(plotCount / plotsPerRow)
    local col = plotCount % plotsPerRow
    
    return Vector3.new(col * spacing, 10, row * spacing)
end

function TycoonManager:UpdateTycoonVisuals(plot, tycoonData)
    -- Update owner sign
    local sign = plot:FindFirstChild("OwnerSign")
    if sign and sign:FindFirstChild("SurfaceGui") then
        local signText = sign.SurfaceGui:FindFirstChild("TextLabel")
        if signText then
            signText.Text = tycoonData.PlayerName .. "'s\n" .. tycoonData.LevelName
        end
    end
    
    -- Add/update buildings based on tycoon level and buildings array
    for buildingName, buildingData in pairs(tycoonData.Buildings or {}) do
        self:CreateBuilding(plot, buildingName, buildingData)
    end
end

function TycoonManager:CreateBuilding(plot, buildingName, buildingData)
    -- Remove existing building if present
    local existingBuilding = plot:FindFirstChild(buildingName)
    if existingBuilding then
        existingBuilding:Destroy()
    end
    
    -- Create building based on type
    local building = nil
    
    if buildingName == "ResourceGenerator" then
        building = self:CreateResourceGenerator(buildingData)
    elseif buildingName == "DefenseTower" then
        building = self:CreateDefenseTower(buildingData)
    elseif buildingName == "Storage" then
        building = self:CreateStorage(buildingData)
    elseif buildingName == "Factory" then
        building = self:CreateFactory(buildingData)
    else
        -- Generic building
        building = self:CreateGenericBuilding(buildingData)
    end
    
    if building then
        building.Name = buildingName
        building.Parent = plot
    end
end

function TycoonManager:CreateResourceGenerator(buildingData)
    local generator = Instance.new("Model")
    
    local mainPart = Instance.new("Part")
    mainPart.Name = "Main"
    mainPart.Size = Vector3.new(8, 8, 8)
    mainPart.Anchored = true
    mainPart.BrickColor = BrickColor.new("Bright blue")
    mainPart.Position = buildingData.Position or Vector3.new(0, 5, 0)
    mainPart.Parent = generator
    
    -- Spinning part for visual effect
    local spinPart = Instance.new("Part")
    spinPart.Name = "Spinner"
    spinPart.Size = Vector3.new(6, 1, 6)
    spinPart.Anchored = false
    spinPart.BrickColor = BrickColor.new("Bright yellow")
    spinPart.Position = mainPart.Position + Vector3.new(0, 5, 0)
    spinPart.Parent = generator
    
    -- Weld spinner to main
    local weld = Instance.new("WeldConstraint")
    weld.Part0 = mainPart
    weld.Part1 = spinPart
    weld.Parent = mainPart
    
    -- Spinning animation
    local spinConnection
    spinConnection = RunService.Heartbeat:Connect(function()
        if spinPart.Parent then
            spinPart.CFrame = spinPart.CFrame * CFrame.Angles(0, math.rad(2), 0)
        else
            spinConnection:Disconnect()
        end
    end)
    
    return generator
end

function TycoonManager:StartProductionLoop()
    spawn(function()
        while true do
            wait(5) -- Production every 5 seconds
            
            for userId, tycoonData in pairs(self.PlayerTycoons) do
                local player = Players:GetPlayerByUserId(userId)
                if player then
                    self:ProduceResources(player, tycoonData)
                end
            end
        end
    end)
end

function TycoonManager:ProduceResources(player, tycoonData)
    if not tycoonData.IsActive then return end
    
    local currentTime = tick()
    local timeDiff = currentTime - (tycoonData.LastProduction or currentTime)
    
    if timeDiff < 1 then return end -- Minimum 1 second between productions
    
    local levelConfig = self.LevelConfig[tycoonData.Level] or self.LevelConfig[1]
    local baseProduction = 10 * levelConfig.ProductionRate
    
    -- Calculate production based on buildings
    local productionMultiplier = 1
    for buildingName, buildingData in pairs(tycoonData.Buildings or {}) do
        if buildingName == "ResourceGenerator" then
            productionMultiplier = productionMultiplier + 0.5
        elseif buildingName == "Factory" then
            productionMultiplier = productionMultiplier + 0.3
        end
    end
    
    local finalProduction = math.floor(baseProduction * productionMultiplier * timeDiff / 5)
    
    -- Add resources
    tycoonData.Resources.Crystals = math.min(
        tycoonData.Resources.Crystals + finalProduction,
        self.ResourceConfig.Crystals.MaxAmount
    )
    
    tycoonData.Resources.Oil = math.min(
        tycoonData.Resources.Oil + math.floor(finalProduction * 0.6),
        self.ResourceConfig.Oil.MaxAmount
    )
    
    tycoonData.Resources.Steel = math.min(
        tycoonData.Resources.Steel + math.floor(finalProduction * 0.4),
        self.ResourceConfig.Steel.MaxAmount
    )
    
    tycoonData.Resources.Energy = math.min(
        tycoonData.Resources.Energy + math.floor(finalProduction * 0.8),
        self.ResourceConfig.Energy.MaxAmount
    )
    
    tycoonData.LastProduction = currentTime
    tycoonData.Stats.TotalResourcesProduced = tycoonData.Stats.TotalResourcesProduced + finalProduction
    
    -- Update leaderstats
    self:UpdateLeaderstats(player, tycoonData)
end

function TycoonManager:UpdateLeaderstats(player, tycoonData)
    local leaderstats = player:FindFirstChild("leaderstats")
    if not leaderstats then return end
    
    -- Update values
    local level = leaderstats:FindFirstChild("Level")
    if level then
        level.Value = tycoonData.Level
    end
    
    local crystals = leaderstats:FindFirstChild("Crystals")
    if crystals then
        crystals.Value = tycoonData.Resources.Crystals
    end
end

function TycoonManager:UpgradeTycoon(player, targetLevel)
    local tycoonData = self.PlayerTycoons[player.UserId]
    if not tycoonData then return false, "Tycoon not found" end
    
    if targetLevel <= tycoonData.Level then
        return false, "Cannot downgrade tycoon"
    end
    
    if targetLevel > #self.LevelConfig then
        return false, "Invalid level"
    end
    
    local levelConfig = self.LevelConfig[targetLevel]
    if not levelConfig then
        return false, "Level configuration not found"
    end
    
    -- Check if player has required resources
    for resourceName, requiredAmount in pairs(levelConfig.RequiredResources) do
        if tycoonData.Resources[resourceName] < requiredAmount then
            return false, "Insufficient " .. resourceName .. ". Required: " .. requiredAmount
        end
    end
    
    -- Deduct resources
    for resourceName, requiredAmount in pairs(levelConfig.RequiredResources) do
        tycoonData.Resources[resourceName] = tycoonData.Resources[resourceName] - requiredAmount
    end
    
    -- Upgrade tycoon
    tycoonData.Level = targetLevel
    tycoonData.LevelName = levelConfig.Name
    tycoonData.ProductionRate = levelConfig.ProductionRate
    tycoonData.Stats.Upgrades = tycoonData.Stats.Upgrades + 1
    
    -- Update visuals
    local plot = game.Workspace.TycoonPlots:FindFirstChild("Plot_" .. player.UserId)
    if plot then
        self:UpdateTycoonVisuals(plot, tycoonData)
    end
    
    -- Update leaderstats
    self:UpdateLeaderstats(player, tycoonData)
    
    return true, "Tycoon upgraded to " .. levelConfig.Name
end

function TycoonManager:ResetTycoon(player)
    local tycoonData = self.PlayerTycoons[player.UserId]
    if not tycoonData then return false, "Tycoon not found" end
    
    -- Reset to default state
    local newTycoonData = self:CreateDefaultTycoon(player)
    self.PlayerTycoons[player.UserId] = newTycoonData
    
    -- Update workspace
    local plot = game.Workspace.TycoonPlots:FindFirstChild("Plot_" .. player.UserId)
    if plot then
        plot:Destroy()
        self:SetupTycoonInWorkspace(player, newTycoonData)
    end
    
    -- Update leaderstats
    self:UpdateLeaderstats(player, newTycoonData)
    
    return true, "Tycoon reset successfully"
end

function TycoonManager:GetTycoonData(player)
    return self.PlayerTycoons[player.UserId]
end

function TycoonManager:GiveResources(player, resourceType, amount)
    local tycoonData = self.PlayerTycoons[player.UserId]
    if not tycoonData then return false, "Tycoon not found" end
    
    local resourceConfig = self.ResourceConfig[resourceType]
    if not resourceConfig then return false, "Invalid resource type" end
    
    tycoonData.Resources[resourceType] = math.min(
        tycoonData.Resources[resourceType] + amount,
        resourceConfig.MaxAmount
    )
    
    self:UpdateLeaderstats(player, tycoonData)
    
    return true, "Added " .. amount .. " " .. resourceType
end

function TycoonManager:SaveAllTycoons()
    for userId, tycoonData in pairs(self.PlayerTycoons) do
        local player = Players:GetPlayerByUserId(userId)
        if player then
            self:SaveTycoonData(player, tycoonData)
        end
    end
end

function TycoonManager:GetServerStats()
    local stats = {
        TotalTycoons = 0,
        ActiveTycoons = 0,
        TotalResources = {
            Crystals = 0,
            Oil = 0,
            Steel = 0,
            Energy = 0
        },
        AverageLevel = 0
    }
    
    local levelSum = 0
    
    for _, tycoonData in pairs(self.PlayerTycoons) do
        stats.TotalTycoons = stats.TotalTycoons + 1
        
        if tycoonData.IsActive then
            stats.ActiveTycoons = stats.ActiveTycoons + 1
        end
        
        for resourceType, amount in pairs(tycoonData.Resources) do
            stats.TotalResources[resourceType] = stats.TotalResources[resourceType] + amount
        end
        
        levelSum = levelSum + tycoonData.Level
    end
    
    if stats.TotalTycoons > 0 then
        stats.AverageLevel = levelSum / stats.TotalTycoons
    end
    
    return stats
end

return TycoonManager