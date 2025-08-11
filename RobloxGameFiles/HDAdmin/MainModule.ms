-- HD Admin Main Module
-- War Tycoon Admin System
-- Module Script (.ms)

local HDAdmin = {}
HDAdmin.__index = HDAdmin

-- Import ranks configuration
local RanksModule = require(script.Parent.Settings.Ranks)

-- Admin Commands
local Commands = require(script.Parent.Commands.AdminCommands)

-- Player Management
local PlayerManager = require(script.Parent.Core.PlayerManager)

-- Configuration
HDAdmin.Version = "6.2.3"
HDAdmin.Creator = "ForeverHD"
HDAdmin.GameName = "War Tycoon"
HDAdmin.Enabled = true

-- Rank System from your provided data
HDAdmin.Ranks = RanksModule.getRanks()

-- Core Functions
function HDAdmin:Init()
    print("[HD Admin] Initializing War Tycoon Admin System v" .. self.Version)
    
    -- Initialize player manager
    PlayerManager:Init()
    
    -- Setup command handlers
    Commands:Init(self)
    
    -- Connect player events
    self:ConnectEvents()
    
    print("[HD Admin] System initialized successfully!")
end

function HDAdmin:ConnectEvents()
    -- Player joined event
    game.Players.PlayerAdded:Connect(function(player)
        self:OnPlayerJoined(player)
    end)
    
    -- Player left event
    game.Players.PlayerRemoving:Connect(function(player)
        self:OnPlayerLeft(player)
    end)
end

function HDAdmin:OnPlayerJoined(player)
    print("[HD Admin] Player joined:", player.Name)
    
    -- Get player rank
    local rank = self:GetPlayerRank(player)
    
    -- Setup player data
    PlayerManager:SetupPlayer(player, rank)
    
    -- Send welcome message if admin
    if rank.RankScore > 0 then
        self:SendMessage(player, "Welcome, " .. rank.RankName .. "!", "System")
    end
end

function HDAdmin:OnPlayerLeft(player)
    print("[HD Admin] Player left:", player.Name)
    PlayerManager:CleanupPlayer(player)
end

function HDAdmin:GetPlayerRank(player)
    -- Default to NonAdmin
    local defaultRank = {
        RankScore = 0,
        RankName = "NonAdmin",
        Permissions = {}
    }
    
    -- Check ranks for this player
    for _, rankData in pairs(self.Ranks) do
        local rankScore, rankName, specificUsers, permissions = unpack(rankData)
        
        -- Check if player is specifically assigned to this rank
        if specificUsers and specificUsers[player.Name] then
            return {
                RankScore = rankScore,
                RankName = rankName,
                Permissions = permissions or {}
            }
        end
        
        -- Check if player has this rank through other means (game passes, etc.)
        -- This would be customized based on your game's rank system
    end
    
    return defaultRank
end

function HDAdmin:ExecuteCommand(player, commandString)
    return Commands:Execute(player, commandString)
end

function HDAdmin:SendMessage(player, message, sender)
    -- Send system message to player
    local gui = player.PlayerGui:FindFirstChild("HDAdminGUI")
    if gui then
        local messageFrame = gui:FindFirstChild("MessageFrame")
        if messageFrame then
            -- Add message to GUI
            local messageLabel = Instance.new("TextLabel")
            messageLabel.Text = "[" .. (sender or "System") .. "] " .. message
            messageLabel.TextColor3 = Color3.new(1, 1, 1)
            messageLabel.BackgroundTransparency = 1
            messageLabel.Parent = messageFrame
        end
    end
end

function HDAdmin:HasPermission(player, permission)
    local playerRank = self:GetPlayerRank(player)
    
    -- Supreme Creator has all permissions
    if playerRank.RankScore >= 5 then
        return true
    end
    
    -- Check specific permissions
    if playerRank.Permissions then
        for _, perm in pairs(playerRank.Permissions) do
            if perm == permission or perm == "all" then
                return true
            end
        end
    end
    
    return false
end

return HDAdmin