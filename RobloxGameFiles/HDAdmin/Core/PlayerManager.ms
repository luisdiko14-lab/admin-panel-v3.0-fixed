-- HD Admin Player Manager Module
-- War Tycoon Player Management System
-- Module Script (.ms)

local PlayerManager = {}
PlayerManager.__index = PlayerManager

local Players = game:GetService("Players")
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

-- Data Stores
local PlayerDataStore = DataStoreService:GetDataStore("HDAdmin_PlayerData")
local BanDataStore = DataStoreService:GetDataStore("HDAdmin_Bans")

-- Player data cache
PlayerManager.PlayerData = {}
PlayerManager.OnlinePlayers = {}

function PlayerManager:Init()
    print("[HD Admin] Player Manager initialized")
    
    -- Connect to player events
    Players.PlayerAdded:Connect(function(player)
        self:OnPlayerJoined(player)
    end)
    
    Players.PlayerRemoving:Connect(function(player)
        self:OnPlayerLeaving(player)
    end)
end

function PlayerManager:OnPlayerJoined(player)
    print("[HD Admin] Processing player join:", player.Name)
    
    -- Check if player is banned
    local isBanned, banReason = self:CheckPlayerBan(player)
    if isBanned then
        player:Kick("You are banned from this game. Reason: " .. (banReason or "No reason provided"))
        return
    end
    
    -- Load player data
    local playerData = self:LoadPlayerData(player)
    if not playerData then
        playerData = self:CreateDefaultPlayerData(player)
    end
    
    -- Cache player data
    self.PlayerData[player.UserId] = playerData
    self.OnlinePlayers[player.UserId] = {
        Player = player,
        JoinTime = tick(),
        LastSeen = tick()
    }
    
    -- Setup player
    self:SetupPlayer(player, playerData)
    
    -- Update last seen
    playerData.LastSeen = os.time()
    
    -- Welcome message
    self:SendWelcomeMessage(player, playerData)
end

function PlayerManager:OnPlayerLeaving(player)
    print("[HD Admin] Processing player leave:", player.Name)
    
    -- Save player data
    if self.PlayerData[player.UserId] then
        self:SavePlayerData(player, self.PlayerData[player.UserId])
        self.PlayerData[player.UserId] = nil
    end
    
    -- Remove from online players
    self.OnlinePlayers[player.UserId] = nil
end

function PlayerManager:CheckPlayerBan(player)
    local success, banData = pcall(function()
        return BanDataStore:GetAsync(tostring(player.UserId))
    end)
    
    if success and banData then
        -- Check if ban is still active
        if banData.Type == "Permanent" then
            return true, banData.Reason
        elseif banData.Type == "Temporary" then
            if os.time() < banData.ExpiresAt then
                return true, banData.Reason .. " (Expires: " .. os.date("%c", banData.ExpiresAt) .. ")"
            else
                -- Ban expired, remove it
                pcall(function()
                    BanDataStore:RemoveAsync(tostring(player.UserId))
                end)
            end
        end
    end
    
    return false, nil
end

function PlayerManager:LoadPlayerData(player)
    local success, data = pcall(function()
        return PlayerDataStore:GetAsync(tostring(player.UserId))
    end)
    
    if success and data then
        return data
    end
    
    return nil
end

function PlayerManager:CreateDefaultPlayerData(player)
    return {
        UserId = player.UserId,
        PlayerName = player.Name,
        RankScore = 0,
        RankName = "NonAdmin",
        Permissions = {},
        
        -- War Tycoon Data
        TycoonLevel = 1,
        Resources = {
            Crystals = 500,
            Oil = 200,
            Steel = 100,
            Energy = 300
        },
        
        -- Stats
        JoinDate = os.time(),
        LastSeen = os.time(),
        PlayTime = 0,
        Warnings = 0,
        
        -- Preferences
        Settings = {
            UIEnabled = true,
            ChatEnabled = true,
            MusicEnabled = true,
            NotificationsEnabled = true
        }
    }
end

function PlayerManager:SavePlayerData(player, data)
    if not data then return false end
    
    -- Update data before saving
    data.PlayerName = player.Name
    data.LastSeen = os.time()
    
    -- Calculate playtime
    if self.OnlinePlayers[player.UserId] then
        local sessionTime = tick() - self.OnlinePlayers[player.UserId].JoinTime
        data.PlayTime = (data.PlayTime or 0) + sessionTime
    end
    
    local success = pcall(function()
        PlayerDataStore:SetAsync(tostring(player.UserId), data)
    end)
    
    if success then
        print("[HD Admin] Saved data for:", player.Name)
        return true
    else
        warn("[HD Admin] Failed to save data for:", player.Name)
        return false
    end
end

function PlayerManager:SetupPlayer(player, playerData)
    -- Wait for character
    local character = player.Character or player.CharacterAdded:Wait()
    
    -- Setup leaderstats
    self:SetupLeaderstats(player, playerData)
    
    -- Setup GUI if admin
    if playerData.RankScore > 0 then
        self:SetupAdminGUI(player, playerData)
    end
    
    -- Setup VIP benefits
    if self:HasVIPAccess(playerData) then
        self:ApplyVIPBenefits(player, playerData)
    end
end

function PlayerManager:SetupLeaderstats(player, playerData)
    local leaderstats = Instance.new("Folder")
    leaderstats.Name = "leaderstats"
    leaderstats.Parent = player
    
    -- Rank
    local rank = Instance.new("StringValue")
    rank.Name = "Rank"
    rank.Value = playerData.RankName
    rank.Parent = leaderstats
    
    -- Tycoon Level
    local level = Instance.new("IntValue")
    level.Name = "Level"
    level.Value = playerData.TycoonLevel or 1
    level.Parent = leaderstats
    
    -- Crystals (main currency)
    local crystals = Instance.new("IntValue")
    crystals.Name = "Crystals"
    crystals.Value = playerData.Resources.Crystals or 0
    crystals.Parent = leaderstats
end

function PlayerManager:SetupAdminGUI(player, playerData)
    -- Create admin GUI
    local gui = Instance.new("ScreenGui")
    gui.Name = "HDAdminGUI"
    gui.Parent = player.PlayerGui
    
    -- Main frame
    local frame = Instance.new("Frame")
    frame.Name = "MainFrame"
    frame.Size = UDim2.new(0, 300, 0, 400)
    frame.Position = UDim2.new(1, -320, 0, 20)
    frame.BackgroundColor3 = Color3.new(0.1, 0.1, 0.1)
    frame.BorderSizePixel = 0
    frame.Parent = gui
    
    -- Title
    local title = Instance.new("TextLabel")
    title.Name = "Title"
    title.Size = UDim2.new(1, 0, 0, 30)
    title.Text = "HD Admin - " .. playerData.RankName
    title.TextColor3 = Color3.new(1, 1, 1)
    title.BackgroundColor3 = Color3.new(0.2, 0.4, 0.8)
    title.BorderSizePixel = 0
    title.Parent = frame
    
    -- Commands list
    local commandsList = Instance.new("ScrollingFrame")
    commandsList.Name = "CommandsList"
    commandsList.Size = UDim2.new(1, 0, 1, -30)
    commandsList.Position = UDim2.new(0, 0, 0, 30)
    commandsList.BackgroundColor3 = Color3.new(0.15, 0.15, 0.15)
    commandsList.BorderSizePixel = 0
    commandsList.CanvasSize = UDim2.new(0, 0, 5, 0)
    commandsList.Parent = frame
    
    -- Add available commands based on rank
    self:PopulateCommands(commandsList, playerData)
end

function PlayerManager:PopulateCommands(parent, playerData)
    local yPos = 0
    local commands = self:GetAvailableCommands(playerData)
    
    for commandName, commandInfo in pairs(commands) do
        local commandButton = Instance.new("TextButton")
        commandButton.Name = commandName
        commandButton.Size = UDim2.new(1, -10, 0, 25)
        commandButton.Position = UDim2.new(0, 5, 0, yPos)
        commandButton.Text = ":" .. commandName .. " - " .. commandInfo.Description
        commandButton.TextColor3 = Color3.new(1, 1, 1)
        commandButton.BackgroundColor3 = Color3.new(0.3, 0.3, 0.3)
        commandButton.BorderSizePixel = 0
        commandButton.TextXAlignment = Enum.TextXAlignment.Left
        commandButton.Parent = parent
        
        yPos = yPos + 30
    end
end

function PlayerManager:GetAvailableCommands(playerData)
    local availableCommands = {}
    
    -- This would integrate with your AdminCommands module
    -- For now, showing example commands based on rank
    if playerData.RankScore >= 4.0 then
        availableCommands["tp"] = {Description = "Teleport player"}
        availableCommands["heal"] = {Description = "Heal player"}
    end
    
    if playerData.RankScore >= 4.5 then
        availableCommands["kick"] = {Description = "Kick player"}
        availableCommands["warn"] = {Description = "Warn player"}
    end
    
    if playerData.RankScore >= 4.9 then
        availableCommands["ban"] = {Description = "Ban player"}
        availableCommands["rank"] = {Description = "Change rank"}
    end
    
    if playerData.RankScore >= 5.0 then
        availableCommands["shutdown"] = {Description = "Shutdown server"}
    end
    
    return availableCommands
end

function PlayerManager:SendWelcomeMessage(player, playerData)
    local message = "Welcome to War Tycoon, " .. player.Name .. "!"
    
    if playerData.RankScore > 0 then
        message = "Welcome back, " .. playerData.RankName .. "!"
    end
    
    if self:HasVIPAccess(playerData) then
        message = message .. " VIP benefits active!"
    end
    
    -- Send message via chat or GUI
    self:SendMessage(player, message, "System")
end

function PlayerManager:SendMessage(player, message, sender)
    -- You can customize this to use your preferred messaging system
    local gui = player.PlayerGui:FindFirstChild("HDAdminGUI")
    if gui then
        -- Add to GUI chat
        local messageFrame = gui:FindFirstChild("MessageFrame")
        if not messageFrame then
            messageFrame = Instance.new("Frame")
            messageFrame.Name = "MessageFrame"
            messageFrame.Size = UDim2.new(1, 0, 0, 100)
            messageFrame.Position = UDim2.new(0, 0, 1, -100)
            messageFrame.BackgroundColor3 = Color3.new(0, 0, 0)
            messageFrame.BackgroundTransparency = 0.5
            messageFrame.Parent = gui
        end
        
        local messageLabel = Instance.new("TextLabel")
        messageLabel.Size = UDim2.new(1, 0, 0, 20)
        messageLabel.Text = "[" .. sender .. "] " .. message
        messageLabel.TextColor3 = Color3.new(1, 1, 1)
        messageLabel.BackgroundTransparency = 1
        messageLabel.TextXAlignment = Enum.TextXAlignment.Left
        messageLabel.Parent = messageFrame
    end
end

function PlayerManager:HasVIPAccess(playerData)
    return playerData.RankScore >= 1 or playerData.VIPStatus == true
end

function PlayerManager:ApplyVIPBenefits(player, playerData)
    -- Apply VIP benefits like speed boost, extra resources, etc.
    if player.Character then
        local humanoid = player.Character:FindFirstChild("Humanoid")
        if humanoid then
            humanoid.WalkSpeed = 20 -- VIP speed boost
        end
    end
end

function PlayerManager:UpdatePlayerRank(player, newRankScore, newRankName)
    if not self.PlayerData[player.UserId] then return false end
    
    local oldRank = self.PlayerData[player.UserId].RankName
    
    -- Update player data
    self.PlayerData[player.UserId].RankScore = newRankScore
    self.PlayerData[player.UserId].RankName = newRankName
    
    -- Update leaderstats
    local leaderstats = player:FindFirstChild("leaderstats")
    if leaderstats then
        local rankValue = leaderstats:FindFirstChild("Rank")
        if rankValue then
            rankValue.Value = newRankName
        end
    end
    
    -- Refresh admin GUI if needed
    if newRankScore > 0 then
        local existingGUI = player.PlayerGui:FindFirstChild("HDAdminGUI")
        if existingGUI then
            existingGUI:Destroy()
        end
        self:SetupAdminGUI(player, self.PlayerData[player.UserId])
    end
    
    -- Log rank change
    print("[HD Admin] Rank changed:", player.Name, "from", oldRank, "to", newRankName)
    
    return true
end

function PlayerManager:GetPlayerData(player)
    return self.PlayerData[player.UserId]
end

function PlayerManager:GetOnlineAdmins()
    local admins = {}
    for userId, playerInfo in pairs(self.OnlinePlayers) do
        local playerData = self.PlayerData[userId]
        if playerData and playerData.RankScore > 0 then
            table.insert(admins, {
                Player = playerInfo.Player,
                RankScore = playerData.RankScore,
                RankName = playerData.RankName
            })
        end
    end
    return admins
end

function PlayerManager:GetPlayerCount()
    return #Players:GetPlayers()
end

function PlayerManager:CleanupPlayer(player)
    -- Clean up any player-specific data, GUIs, etc.
    local gui = player.PlayerGui:FindFirstChild("HDAdminGUI")
    if gui then
        gui:Destroy()
    end
end

return PlayerManager