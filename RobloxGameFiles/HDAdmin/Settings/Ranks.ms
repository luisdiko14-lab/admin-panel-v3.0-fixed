-- HD Admin Ranks Module
-- War Tycoon Rank System
-- Module Script (.ms)

local Ranks = {}

-- Rank data from your provided hierarchy
function Ranks.getRanks()
    return {
        {5, "41 | Supreme Creator", {}, {"all"}},
        {4.999, "40 | Supreme Real Co-Creator", {"e", 0}, {"admin", "moderate", "kick", "ban", "teleport"}},
        {4.9875, "39 | Supreme Founder of Development Creation", {"e", 0}, {"admin", "moderate", "kick", "ban"}},
        {4.9975, "38.5 | Supreme Head of Foundation", {"e", 0}, {"admin", "moderate", "kick", "ban"}},
        {4.98, "38 | Supreme King of Kings", {"e", 0}, {"admin", "moderate", "kick", "ban"}},
        {4.967, "37.5 | Supreme Liaison of Power", {"e", 0}, {"admin", "moderate", "kick"}},
        {4.96, "36 | Supreme 26.5 Lord of Foundation", {"e", 0}, {"admin", "moderate", "kick"}},
        {4.955, "36 | Supreme 10.5 Office Director", {}, {"admin", "moderate", "kick"}},
        {4.952, "36.5 | Supreme Meta Administrator", {"e", 0}, {"admin", "moderate", "kick"}},
        {4.94, "36 | Supreme Galactic Administration", {"e", 0}, {"admin", "moderate", "kick"}},
        {4.92, "35 | Supreme Extra King", {"e", 0}, {"admin", "moderate"}},
        {4.915, "34 | Supreme Ultra King", {"e", 0}, {"admin", "moderate"}},
        {4.906, "34 | Supreme Hyper King", {"e", 0}, {"admin", "moderate"}},
        {4.936, "33 | Supreme Mega King", {"e", 0}, {"admin", "moderate"}},
        {4.933, "33 | Supreme Super Omega King", {"e", 0}, {"admin", "moderate"}},
        {4.93, "31 | Supreme Head of Foundation", {"e", 0}, {"moderate", "kick"}},
        {4.928, "31 | Supreme 05 Council", {"e", 0}, {"moderate", "kick"}},
        {4.926, "30 | Supreme Admin of Foundation", {"e", 0}, {"moderate", "kick"}},
        {4.925, "30 | Supreme Duckdadmin", {"e", 0}, {"moderate", "kick"}},
        {4.92, "29 | Supreme Foundation", {"e", 0}, {"moderate", "kick"}},
        {4.915, "27.5 | Supreme Captain Sheriff", {"e", 0}, {"moderate", "kick"}},
        {4.911, "27.5 | Supreme Experienced Sheriff", {"e", 0}, {"moderate", "kick"}},
        {4.91, "26 | Supreme Sheriff", {"e", 0}, {"moderate", "kick", "warn"}},
        {4.908, "25 | Supreme Co-style", {"e", 0}, {"moderate", "warn"}},
        {4.905, "24 | Supreme Zero-Archangel", {"e", 0}, {"moderate", "warn"}},
        {4.902, "23 | Supreme Underexposed", {"e", 0}, {"moderate", "warn"}},
        {4.89, "21 | Supreme Friends", {"e", 0}, {"warn"}},
        {4.885, "20 | Supreme Agents Developers", {"e", 0}, {"warn"}},
        {4.884, "19 | Supreme Guards", {"e", 0}, {"warn"}},
        {4.882, "18 | Supreme Agents", {"e", 0}, {"warn"}},
        {4.88, "17 | Supreme Owner", {"e", 0}, {"kick"}},
        {4.879, "16 | Supreme Overseer", {"e", 0}, {"kick"}},
        {4.876, "15 | Supreme Administrator", {"e", 0}, {"kick"}},
        {4.873, "14 | Supreme Head of Developers", {"e", 0}, {"teleport"}},
        {4.865, "13 | Supreme Chief Developers", {"e", 0}, {"teleport"}},
        {4.862, "12 | Supreme Developers", {"e", 0}, {"teleport"}},
        {4.86, "11 | Supreme Hacker", {"e", 0}, {"teleport"}},
        {4.855, "10 | Supreme Owner", {"e", 0}, {"teleport"}},
        {4.85, "9 | Supreme Host", {"e", 0}, {"basic_commands"}},
        {4.849, "8 | Supreme Co-Host", {"e", 0}, {"basic_commands"}},
        {4.8, "7 | Supreme Trainer", {"e", 0}, {"basic_commands"}},
        {4.6, "6 | Supreme HeadAdmin", {"e", 0}, {"basic_commands"}},
        {4.5, "5 | Supreme 1.5 Administrator", {"e", 0}, {"basic_commands"}},
        {4, "4 | Supreme Mod", {"e", 0}, {"view_commands"}},
        {3, "3 | Supreme Head Mod", {"e", 0}, {"view_commands"}},
        {2, "2 | Supreme Test Mod", {"e", 0}, {"view_commands"}},
        {1, "1 | Supreme VIP", {"e", 0}, {"vip_perks"}},
        {0, "NonAdmin", {}, {}}
    }
end

-- Permission hierarchy check
function Ranks.hasPermission(rankScore, permission)
    if rankScore >= 5 then
        return true -- Supreme Creator has all permissions
    end
    
    local ranks = Ranks.getRanks()
    for _, rankData in pairs(ranks) do
        local score, name, users, permissions = unpack(rankData)
        if score == rankScore then
            if permissions then
                for _, perm in pairs(permissions) do
                    if perm == permission or perm == "all" then
                        return true
                    end
                end
            end
            break
        end
    end
    
    return false
end

-- Get rank info by score
function Ranks.getRankInfo(rankScore)
    local ranks = Ranks.getRanks()
    for _, rankData in pairs(ranks) do
        local score, name, users, permissions = unpack(rankData)
        if score == rankScore then
            return {
                RankScore = score,
                RankName = name,
                SpecificUsers = users,
                Permissions = permissions
            }
        end
    end
    
    -- Return NonAdmin as default
    return {
        RankScore = 0,
        RankName = "NonAdmin",
        SpecificUsers = {},
        Permissions = {}
    }
end

-- Get all ranks for display
function Ranks.getAllRanks()
    local formattedRanks = {}
    local ranks = Ranks.getRanks()
    
    for i, rankData in pairs(ranks) do
        local score, name, users, permissions = unpack(rankData)
        table.insert(formattedRanks, {
            Index = i,
            RankScore = score,
            RankName = name,
            SpecificUsers = users,
            Permissions = permissions,
            UserCount = users and #users or 0
        })
    end
    
    return formattedRanks
end

return Ranks