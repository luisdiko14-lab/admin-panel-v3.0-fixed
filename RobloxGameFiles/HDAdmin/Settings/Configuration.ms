-- HD Admin Configuration Module
-- War Tycoon Game Settings
-- Module Script (.ms)

local Configuration = {}

-- Game Information
Configuration.GameInfo = {
    Name = "War Tycoon",
    GameId = 81068715488268,
    CreatorId = 1, -- Replace with your Roblox user ID
    Version = "1.0.0",
    MaxPlayers = 50
}

-- Admin Settings
Configuration.AdminSettings = {
    Enabled = true,
    AutoRank = false, -- Automatically rank players based on game passes
    CommandPrefix = ":", -- Command prefix (e.g., :tp, :ban)
    AdminGUIEnabled = true,
    LogCommands = true,
    AntiExploit = true,
    
    -- Command Settings
    Commands = {
        Teleport = true,
        Ban = true,
        Kick = true,
        Warn = true,
        Give = true,
        Rank = true,
        Shutdown = true,
        Message = true,
        Announce = true
    },
    
    -- UI Settings
    UITheme = "Dark",
    UITransparency = 0.1,
    UIPosition = "TopRight",
    
    -- Security Settings
    MaxWarnings = 3,
    AutoBanOnMaxWarnings = true,
    CommandCooldown = 1, -- Seconds between commands
    LogRetentionDays = 30
}

-- War Tycoon Specific Settings
Configuration.WarTycoonSettings = {
    -- Tycoon Management
    MaxTycoonsPerPlayer = 1,
    TycoonResetOnLeave = false,
    AutoSaveTycoons = true,
    SaveInterval = 300, -- 5 minutes
    
    -- Territory System
    TerritoryWars = true,
    CaptureTime = 60, -- Seconds to capture territory
    TerritoryRewards = {
        Crystals = 100,
        Oil = 50,
        Steel = 25,
        Energy = 75
    },
    
    -- Resource Settings
    StartingResources = {
        Crystals = 500,
        Oil = 200,
        Steel = 100,
        Energy = 300
    },
    
    MaxResources = {
        Crystals = 999999,
        Oil = 999999,
        Steel = 999999,
        Energy = 999999
    },
    
    -- PvP Settings
    PvPEnabled = true,
    SafeZones = {"Spawn", "Shop", "Bank"},
    KillRewards = {
        Crystals = 25,
        Experience = 10
    },
    
    -- Economy Settings
    ShopEnabled = true,
    TradingEnabled = true,
    AuctionHouse = false,
    
    -- VIP Settings
    VIPBenefits = {
        ResourceMultiplier = 2,
        ExtraSpawnItems = true,
        PrioritySupport = true,
        CustomColors = true
    }
}

-- Permission Templates
Configuration.PermissionTemplates = {
    ["Supreme"] = {"all"},
    ["Admin"] = {"admin", "moderate", "kick", "ban", "teleport", "give"},
    ["Moderator"] = {"moderate", "kick", "warn", "teleport"},
    ["Staff"] = {"warn", "teleport", "basic_commands"},
    ["VIP"] = {"vip_perks", "priority_support"},
    ["Player"] = {}
}

-- Server Messages
Configuration.Messages = {
    Welcome = "Welcome to War Tycoon! Build your empire and conquer territories!",
    VIPWelcome = "Welcome back, VIP! Enjoy your premium benefits!",
    AdminWelcome = "Admin access granted. Use responsibly.",
    
    ServerShutdown = "Server shutting down for maintenance. Thanks for playing!",
    UpdateMessage = "Game updated! Check out the new features!",
    
    Warnings = {
        FirstWarning = "This is your first warning. Please follow the rules.",
        SecondWarning = "Second warning! Next violation may result in a ban.",
        FinalWarning = "Final warning! One more violation will result in a ban."
    },
    
    Bans = {
        Temporary = "You have been temporarily banned. Reason: %s",
        Permanent = "You have been permanently banned. Reason: %s",
        Appeal = "To appeal your ban, contact us at: [Discord/Website]"
    }
}

-- Default Data Store Keys
Configuration.DataStoreKeys = {
    PlayerData = "PlayerData_v1",
    TycoonData = "TycoonData_v1",
    TerritoryData = "TerritoryData_v1",
    BanData = "BanData_v1",
    Settings = "GameSettings_v1"
}

-- Remote Events and Functions
Configuration.Remotes = {
    Events = {
        "CommandExecuted",
        "PlayerRanked",
        "PlayerWarned",
        "PlayerBanned",
        "TycoonUpdated",
        "TerritoryCapture",
        "ResourceUpdate"
    },
    Functions = {
        "GetPlayerData",
        "ExecuteCommand",
        "UpdateTycoon",
        "CaptureTerritory",
        "BuyItem"
    }
}

-- Validation Functions
function Configuration:ValidateRankScore(score)
    return type(score) == "number" and score >= 0 and score <= 5
end

function Configuration:ValidatePermission(permission)
    local validPermissions = {
        "all", "admin", "moderate", "kick", "ban", "warn", 
        "teleport", "give", "basic_commands", "view_commands", "vip_perks"
    }
    
    for _, validPerm in pairs(validPermissions) do
        if permission == validPerm then
            return true
        end
    end
    
    return false
end

function Configuration:GetSetting(category, setting)
    if self[category] and self[category][setting] ~= nil then
        return self[category][setting]
    end
    return nil
end

function Configuration:UpdateSetting(category, setting, value)
    if self[category] then
        self[category][setting] = value
        return true
    end
    return false
end

return Configuration