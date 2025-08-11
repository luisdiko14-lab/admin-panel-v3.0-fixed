-- HD Admin Commands Module
-- War Tycoon Admin Commands
-- Module Script (.ms)

local AdminCommands = {}
AdminCommands.__index = AdminCommands

local Players = game:GetService("Players")
local TeleportService = game:GetService("TeleportService")
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")

-- Command definitions
AdminCommands.Commands = {
    -- Teleport Commands
    ["tp"] = {
        Permission = "teleport",
        MinRank = 4.8,
        Usage = ":tp [player] [target/coordinates]",
        Description = "Teleport player to target or coordinates",
        Function = "TeleportPlayer"
    },
    ["bring"] = {
        Permission = "teleport",
        MinRank = 4.8,
        Usage = ":bring [player]",
        Description = "Bring player to you",
        Function = "BringPlayer"
    },
    ["goto"] = {
        Permission = "teleport",
        MinRank = 4.8,
        Usage = ":goto [player]",
        Description = "Go to player",
        Function = "GotoPlayer"
    },
    
    -- Moderation Commands
    ["ban"] = {
        Permission = "ban",
        MinRank = 4.9,
        Usage = ":ban [player] [reason]",
        Description = "Ban player from the game",
        Function = "BanPlayer"
    },
    ["unban"] = {
        Permission = "ban",
        MinRank = 4.9,
        Usage = ":unban [userId]",
        Description = "Unban player",
        Function = "UnbanPlayer"
    },
    ["kick"] = {
        Permission = "kick",
        MinRank = 4.5,
        Usage = ":kick [player] [reason]",
        Description = "Kick player from server",
        Function = "KickPlayer"
    },
    ["warn"] = {
        Permission = "warn",
        MinRank = 4.0,
        Usage = ":warn [player] [reason]",
        Description = "Warn player",
        Function = "WarnPlayer"
    },
    
    -- Rank Commands
    ["rank"] = {
        Permission = "admin",
        MinRank = 4.95,
        Usage = ":rank [player] [rank]",
        Description = "Set player rank",
        Function = "RankPlayer"
    },
    ["demote"] = {
        Permission = "admin", 
        MinRank = 4.9,
        Usage = ":demote [player]",
        Description = "Demote player rank",
        Function = "DemotePlayer"
    },
    ["promote"] = {
        Permission = "admin",
        MinRank = 4.9,
        Usage = ":promote [player]",
        Description = "Promote player rank",
        Function = "PromotePlayer"
    },
    
    -- Game Commands
    ["give"] = {
        Permission = "give",
        MinRank = 4.5,
        Usage = ":give [player] [item] [amount]",
        Description = "Give items to player",
        Function = "GiveItem"
    },
    ["heal"] = {
        Permission = "basic_commands",
        MinRank = 4.0,
        Usage = ":heal [player]",
        Description = "Heal player",
        Function = "HealPlayer"
    },
    ["speed"] = {
        Permission = "basic_commands",
        MinRank = 4.0,
        Usage = ":speed [player] [speed]",
        Description = "Set player speed",
        Function = "SetSpeed"
    },
    
    -- Server Commands
    ["shutdown"] = {
        Permission = "all",
        MinRank = 5.0,
        Usage = ":shutdown [message]",
        Description = "Shutdown server",
        Function = "ShutdownServer"
    },
    ["announce"] = {
        Permission = "moderate",
        MinRank = 4.5,
        Usage = ":announce [message]",
        Description = "Server announcement",
        Function = "Announce"
    },
    ["message"] = {
        Permission = "moderate",
        MinRank = 4.5,
        Usage = ":message [player] [message]",
        Description = "Send message to player",
        Function = "MessagePlayer"
    },
    
    -- War Tycoon Specific Commands
    ["settycoon"] = {
        Permission = "admin",
        MinRank = 4.8,
        Usage = ":settycoon [player] [level]",
        Description = "Set player tycoon level",
        Function = "SetTycoon"
    },
    ["resetycoon"] = {
        Permission = "admin",
        MinRank = 4.7,
        Usage = ":resetycoon [player]",
        Description = "Reset player tycoon",
        Function = "ResetTycoon"
    },
    ["giveresource"] = {
        Permission = "give",
        MinRank = 4.5,
        Usage = ":giveresource [player] [resource] [amount]",
        Description = "Give resources to player",
        Function = "GiveResource"
    },
    ["captureterritory"] = {
        Permission = "admin",
        MinRank = 4.8,
        Usage = ":captureterritory [territory] [team]",
        Description = "Force capture territory",
        Function = "CaptureTerritory"
    }
}

function AdminCommands:Init(hdAdmin)
    self.HDAdmin = hdAdmin
    print("[HD Admin] Commands module initialized")
end

function AdminCommands:Execute(executor, commandString)
    local args = self:ParseCommand(commandString)
    if not args or #args == 0 then
        return false, "Invalid command format"
    end
    
    local commandName = args[1]:lower()
    local command = self.Commands[commandName]
    
    if not command then
        return false, "Unknown command: " .. commandName
    end
    
    -- Check permissions
    local hasPermission, reason = self:CheckPermissions(executor, command)
    if not hasPermission then
        return false, reason
    end
    
    -- Execute command
    local success, result = pcall(function()
        return self[command.Function](self, executor, args)
    end)
    
    if success then
        -- Log command execution
        self:LogCommand(executor, commandString, result)
        return true, result
    else
        return false, "Command execution failed: " .. tostring(result)
    end
end

function AdminCommands:ParseCommand(commandString)
    local args = {}
    for arg in string.gmatch(commandString, "%S+") do
        table.insert(args, arg)
    end
    return args
end

function AdminCommands:CheckPermissions(executor, command)
    if not executor or not executor.Character then
        return false, "Invalid executor"
    end
    
    local executorRank = self.HDAdmin:GetPlayerRank(executor)
    
    -- Check rank requirement
    if executorRank.RankScore < command.MinRank then
        return false, "Insufficient rank. Required: " .. command.MinRank
    end
    
    -- Check permission
    if not self.HDAdmin:HasPermission(executor, command.Permission) then
        return false, "Missing permission: " .. command.Permission
    end
    
    return true, nil
end

-- Command Functions
function AdminCommands:TeleportPlayer(executor, args)
    if #args < 3 then
        return "Usage: " .. self.Commands["tp"].Usage
    end
    
    local targetPlayer = self:FindPlayer(args[2])
    if not targetPlayer then
        return "Player not found: " .. args[2]
    end
    
    local destination = self:FindPlayer(args[3])
    if destination and destination.Character and destination.Character:FindFirstChild("HumanoidRootPart") then
        -- Teleport to player
        if targetPlayer.Character and targetPlayer.Character:FindFirstChild("HumanoidRootPart") then
            targetPlayer.Character.HumanoidRootPart.CFrame = destination.Character.HumanoidRootPart.CFrame
            return "Teleported " .. targetPlayer.Name .. " to " .. destination.Name
        end
    else
        -- Try to parse coordinates
        local x, y, z = string.match(args[3], "([%-]?%d+),([%-]?%d+),([%-]?%d+)")
        if x and y and z then
            if targetPlayer.Character and targetPlayer.Character:FindFirstChild("HumanoidRootPart") then
                targetPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(tonumber(x), tonumber(y), tonumber(z))
                return "Teleported " .. targetPlayer.Name .. " to coordinates"
            end
        end
    end
    
    return "Failed to teleport player"
end

function AdminCommands:BanPlayer(executor, args)
    if #args < 3 then
        return "Usage: " .. self.Commands["ban"].Usage
    end
    
    local targetPlayer = self:FindPlayer(args[2])
    if not targetPlayer then
        return "Player not found: " .. args[2]
    end
    
    local reason = table.concat(args, " ", 3)
    
    -- Add to ban datastore
    local banStore = DataStoreService:GetDataStore("HDAdmin_Bans")
    local banData = {
        UserId = targetPlayer.UserId,
        PlayerName = targetPlayer.Name,
        BannedBy = executor.Name,
        Reason = reason,
        Timestamp = os.time(),
        Type = "Permanent"
    }
    
    pcall(function()
        banStore:SetAsync(tostring(targetPlayer.UserId), banData)
    end)
    
    -- Kick player
    targetPlayer:Kick("You have been banned. Reason: " .. reason)
    
    return "Banned " .. targetPlayer.Name .. " for: " .. reason
end

function AdminCommands:KickPlayer(executor, args)
    if #args < 2 then
        return "Usage: " .. self.Commands["kick"].Usage
    end
    
    local targetPlayer = self:FindPlayer(args[2])
    if not targetPlayer then
        return "Player not found: " .. args[2]
    end
    
    local reason = "No reason provided"
    if #args > 2 then
        reason = table.concat(args, " ", 3)
    end
    
    targetPlayer:Kick("You have been kicked. Reason: " .. reason)
    
    return "Kicked " .. targetPlayer.Name .. " for: " .. reason
end

function AdminCommands:GiveResource(executor, args)
    if #args < 4 then
        return "Usage: " .. self.Commands["giveresource"].Usage
    end
    
    local targetPlayer = self:FindPlayer(args[2])
    if not targetPlayer then
        return "Player not found: " .. args[2]
    end
    
    local resourceType = args[3]:lower()
    local amount = tonumber(args[4])
    
    if not amount or amount <= 0 then
        return "Invalid amount: " .. args[4]
    end
    
    local validResources = {"crystals", "oil", "steel", "energy"}
    local isValidResource = false
    
    for _, resource in pairs(validResources) do
        if resourceType == resource then
            isValidResource = true
            break
        end
    end
    
    if not isValidResource then
        return "Invalid resource type. Valid: " .. table.concat(validResources, ", ")
    end
    
    -- Here you would integrate with your tycoon system
    -- For now, return success message
    return "Gave " .. amount .. " " .. resourceType .. " to " .. targetPlayer.Name
end

function AdminCommands:Announce(executor, args)
    if #args < 2 then
        return "Usage: " .. self.Commands["announce"].Usage
    end
    
    local message = table.concat(args, " ", 2)
    
    -- Send to all players
    for _, player in pairs(Players:GetPlayers()) do
        self.HDAdmin:SendMessage(player, message, "Server")
    end
    
    return "Announced: " .. message
end

-- Utility Functions
function AdminCommands:FindPlayer(query)
    query = query:lower()
    
    -- Try exact match first
    for _, player in pairs(Players:GetPlayers()) do
        if player.Name:lower() == query then
            return player
        end
    end
    
    -- Try partial match
    for _, player in pairs(Players:GetPlayers()) do
        if player.Name:lower():match("^" .. query) then
            return player
        end
    end
    
    return nil
end

function AdminCommands:LogCommand(executor, command, result)
    local logData = {
        ExecutorName = executor.Name,
        ExecutorUserId = executor.UserId,
        Command = command,
        Result = result,
        Timestamp = os.time()
    }
    
    -- Log to DataStore
    local logStore = DataStoreService:GetDataStore("HDAdmin_CommandLogs")
    pcall(function()
        local logKey = executor.UserId .. "_" .. os.time()
        logStore:SetAsync(logKey, logData)
    end)
    
    print("[HD Admin] Command executed: " .. executor.Name .. " - " .. command)
end

return AdminCommands