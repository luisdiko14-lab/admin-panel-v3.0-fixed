-- HD Admin Loader Script
-- War Tycoon Server-Side Admin System
-- Server Script (.s)

-- Services
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerStorage = game:GetService("ServerStorage")
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")

-- Create Remote Events folder
local remotesFolder = Instance.new("Folder")
remotesFolder.Name = "HDAdminRemotes"
remotesFolder.Parent = ReplicatedStorage

-- Remote Events
local executeCommandEvent = Instance.new("RemoteEvent")
executeCommandEvent.Name = "ExecuteCommand"
executeCommandEvent.Parent = remotesFolder

local playerRankedEvent = Instance.new("RemoteEvent")
playerRankedEvent.Name = "PlayerRanked"
playerRankedEvent.Parent = remotesFolder

local serverAnnouncementEvent = Instance.new("RemoteEvent")
serverAnnouncementEvent.Name = "ServerAnnouncement"
serverAnnouncementEvent.Parent = remotesFolder

-- Remote Functions
local getPlayerDataFunction = Instance.new("RemoteFunction")
getPlayerDataFunction.Name = "GetPlayerData"
getPlayerDataFunction.Parent = remotesFolder

local getServerStatsFunction = Instance.new("RemoteFunction")
getServerStatsFunction.Name = "GetServerStats"
getServerStatsFunction.Parent = remotesFolder

-- Load HD Admin Module
print("[HD Admin] Loading War Tycoon Admin System...")

-- Get the HD Admin module (adjust path as needed)
local hdAdminModule = script.Parent.MainModule
local HDAdmin = require(hdAdminModule)

-- Initialize HD Admin
HDAdmin:Init()

-- Global reference for other scripts
_G.HDAdmin = HDAdmin

print("[HD Admin] War Tycoon Admin System loaded successfully!")

-- Remote Event Handlers
executeCommandEvent.OnServerEvent:Connect(function(player, commandString)
    if not commandString or type(commandString) ~= "string" then
        return
    end
    
    -- Security check - ensure player is authenticated and has permissions
    local playerRank = HDAdmin:GetPlayerRank(player)
    if playerRank.RankScore <= 0 then
        return -- Not an admin
    end
    
    -- Execute command
    local success, result = HDAdmin:ExecuteCommand(player, commandString)
    
    -- Send result back to player
    if success then
        HDAdmin:SendMessage(player, "✅ " .. result, "System")
    else
        HDAdmin:SendMessage(player, "❌ " .. result, "System")
    end
end)

getPlayerDataFunction.OnServerInvoke = function(player)
    if not player then return nil end
    
    local playerRank = HDAdmin:GetPlayerRank(player)
    local playerManager = require(script.Parent.Core.PlayerManager)
    local playerData = playerManager:GetPlayerData(player)
    
    if playerData then
        return {
            RankScore = playerRank.RankScore,
            RankName = playerRank.RankName,
            Permissions = playerRank.Permissions,
            TycoonLevel = playerData.TycoonLevel or 1,
            Resources = playerData.Resources or {},
            Settings = playerData.Settings or {}
        }
    else
        return {
            RankScore = playerRank.RankScore,
            RankName = playerRank.RankName,
            Permissions = playerRank.Permissions,
            TycoonLevel = 1,
            Resources = {},
            Settings = {}
        }
    end
end

getServerStatsFunction.OnServerInvoke = function(player)
    -- Only admins can see detailed server stats
    local playerRank = HDAdmin:GetPlayerRank(player)
    if playerRank.RankScore < 4.0 then
        return nil
    end
    
    return {
        OnlinePlayers = #Players:GetPlayers(),
        AdminsOnline = #HDAdmin.PlayerManager:GetOnlineAdmins(),
        ServerUptime = tick() - game.Workspace.DistributedGameTime,
        PlaceId = game.PlaceId,
        JobId = game.JobId
    }
end

-- Anti-exploit measures
local function validatePlayer(player)
    if not player or not player.Parent then
        return false
    end
    
    if not player.Character then
        return false
    end
    
    return true
end

-- Command cooldown system
local commandCooldowns = {}
local COMMAND_COOLDOWN = 1 -- seconds

executeCommandEvent.OnServerEvent:Connect(function(player, ...)
    if not validatePlayer(player) then
        return
    end
    
    -- Check cooldown
    local userId = player.UserId
    local currentTime = tick()
    
    if commandCooldowns[userId] and (currentTime - commandCooldowns[userId]) < COMMAND_COOLDOWN then
        HDAdmin:SendMessage(player, "Please wait before executing another command", "System")
        return
    end
    
    commandCooldowns[userId] = currentTime
end)

-- Auto-save system
spawn(function()
    while true do
        wait(300) -- Save every 5 minutes
        
        print("[HD Admin] Auto-saving player data...")
        
        local playerManager = require(script.Parent.Core.PlayerManager)
        for _, player in pairs(Players:GetPlayers()) do
            local playerData = playerManager:GetPlayerData(player)
            if playerData then
                playerManager:SavePlayerData(player, playerData)
            end
        end
        
        print("[HD Admin] Auto-save completed")
    end
end)

-- Server shutdown handler
game:BindToClose(function()
    print("[HD Admin] Server shutting down, saving all data...")
    
    local playerManager = require(script.Parent.Core.PlayerManager)
    for _, player in pairs(Players:GetPlayers()) do
        local playerData = playerManager:GetPlayerData(player)
        if playerData then
            playerManager:SavePlayerData(player, playerData)
        end
    end
    
    wait(3) -- Give time for data to save
    print("[HD Admin] All data saved, server can shutdown")
end)

-- Chat commands integration
Players.PlayerAdded:Connect(function(player)
    player.Chatted:Connect(function(message)
        -- Check if message starts with command prefix
        if message:sub(1, 1) == ":" then
            -- Check if player has admin permissions
            local playerRank = HDAdmin:GetPlayerRank(player)
            if playerRank.RankScore > 0 then
                -- Execute as admin command
                local success, result = HDAdmin:ExecuteCommand(player, message)
                
                -- Send result
                if success then
                    HDAdmin:SendMessage(player, "✅ " .. result, "Command")
                else
                    HDAdmin:SendMessage(player, "❌ " .. result, "Command")
                end
            end
        end
    end)
end)

-- Server statistics tracking
local ServerStats = {
    StartTime = tick(),
    CommandsExecuted = 0,
    PlayersServed = 0,
    AdminActions = 0
}

-- Hook into command execution for stats
local originalExecuteCommand = HDAdmin.ExecuteCommand
HDAdmin.ExecuteCommand = function(self, player, commandString)
    ServerStats.CommandsExecuted = ServerStats.CommandsExecuted + 1
    ServerStats.AdminActions = ServerStats.AdminActions + 1
    
    return originalExecuteCommand(self, player, commandString)
end

-- Hook into player join for stats
local originalOnPlayerJoined = HDAdmin.OnPlayerJoined
HDAdmin.OnPlayerJoined = function(self, player)
    ServerStats.PlayersServed = ServerStats.PlayersServed + 1
    
    return originalOnPlayerJoined(self, player)
end

-- Periodic stats logging
spawn(function()
    while true do
        wait(3600) -- Every hour
        
        local stats = {
            Uptime = tick() - ServerStats.StartTime,
            PlayersOnline = #Players:GetPlayers(),
            CommandsExecuted = ServerStats.CommandsExecuted,
            PlayersServed = ServerStats.PlayersServed,
            AdminActions = ServerStats.AdminActions
        }
        
        print("[HD Admin] Hourly Stats:", HttpService:JSONEncode(stats))
    end
end)

-- Web API integration (if you have HTTP requests enabled)
local function sendWebhookData(data)
    local webhookUrl = "" -- Add your webhook URL here
    
    if webhookUrl ~= "" then
        local success = pcall(function()
            HttpService:PostAsync(webhookUrl, HttpService:JSONEncode(data), Enum.HttpContentType.ApplicationJson)
        end)
        
        if not success then
            warn("[HD Admin] Failed to send webhook data")
        end
    end
end

-- Important admin actions webhook
local originalBanPlayer = HDAdmin.Commands.BanPlayer or function() end
HDAdmin.Commands.BanPlayer = function(self, executor, args)
    local result = originalBanPlayer(self, executor, args)
    
    -- Send webhook notification
    sendWebhookData({
        type = "player_banned",
        executor = executor.Name,
        target = args[2] or "unknown",
        reason = table.concat(args, " ", 3) or "No reason",
        timestamp = os.date("%Y-%m-%d %H:%M:%S")
    })
    
    return result
end

print("[HD Admin] Server-side loader completed successfully!")
print("[HD Admin] Game ID: " .. game.PlaceId)
print("[HD Admin] Ready to accept admin commands!")