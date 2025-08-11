-- HD Admin GUI Client
-- War Tycoon Admin Interface
-- Local Script (.ls)

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local playerGui = player:WaitForChild("PlayerGui")

local AdminGUI = {}
AdminGUI.IsOpen = false
AdminGUI.CurrentTab = "Commands"

-- Wait for remote events
local remotes = ReplicatedStorage:WaitForChild("HDAdminRemotes")
local executeCommand = remotes:WaitForChild("ExecuteCommand")
local getPlayerData = remotes:WaitForChild("GetPlayerData")

-- Get player data
local playerData = getPlayerData:InvokeServer()
if not playerData or playerData.RankScore <= 0 then
    -- Player is not admin, don't create GUI
    return
end

function AdminGUI:CreateGUI()
    -- Main ScreenGui
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "HDAdminGUI"
    screenGui.ResetOnSpawn = false
    screenGui.Parent = playerGui
    
    -- Main Frame
    local mainFrame = Instance.new("Frame")
    mainFrame.Name = "MainFrame"
    mainFrame.Size = UDim2.new(0, 500, 0, 400)
    mainFrame.Position = UDim2.new(0.5, -250, 0.5, -200)
    mainFrame.BackgroundColor3 = Color3.fromRGB(35, 35, 35)
    mainFrame.BorderSizePixel = 0
    mainFrame.Visible = false
    mainFrame.Parent = screenGui
    
    -- Corner radius
    local corner = Instance.new("UICorner")
    corner.CornerRadius = UDim.new(0, 10)
    corner.Parent = mainFrame
    
    -- Title bar
    local titleBar = Instance.new("Frame")
    titleBar.Name = "TitleBar"
    titleBar.Size = UDim2.new(1, 0, 0, 40)
    titleBar.BackgroundColor3 = Color3.fromRGB(25, 25, 25)
    titleBar.BorderSizePixel = 0
    titleBar.Parent = mainFrame
    
    local titleCorner = Instance.new("UICorner")
    titleCorner.CornerRadius = UDim.new(0, 10)
    titleCorner.Parent = titleBar
    
    -- Title text
    local titleText = Instance.new("TextLabel")
    titleText.Name = "TitleText"
    titleText.Size = UDim2.new(1, -80, 1, 0)
    titleText.Position = UDim2.new(0, 10, 0, 0)
    titleText.Text = "HD Admin - " .. playerData.RankName
    titleText.TextColor3 = Color3.fromRGB(255, 255, 255)
    titleText.TextSize = 18
    titleText.Font = Enum.Font.SourceSansBold
    titleText.TextXAlignment = Enum.TextXAlignment.Left
    titleText.BackgroundTransparency = 1
    titleText.Parent = titleBar
    
    -- Close button
    local closeButton = Instance.new("TextButton")
    closeButton.Name = "CloseButton"
    closeButton.Size = UDim2.new(0, 30, 0, 30)
    closeButton.Position = UDim2.new(1, -35, 0, 5)
    closeButton.Text = "×"
    closeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    closeButton.TextSize = 20
    closeButton.Font = Enum.Font.SourceSansBold
    closeButton.BackgroundColor3 = Color3.fromRGB(255, 0, 0)
    closeButton.BorderSizePixel = 0
    closeButton.Parent = titleBar
    
    local closeCorner = Instance.new("UICorner")
    closeCorner.CornerRadius = UDim.new(0, 5)
    closeCorner.Parent = closeButton
    
    -- Tab buttons
    local tabFrame = Instance.new("Frame")
    tabFrame.Name = "TabFrame"
    tabFrame.Size = UDim2.new(1, 0, 0, 40)
    tabFrame.Position = UDim2.new(0, 0, 0, 40)
    tabFrame.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
    tabFrame.BorderSizePixel = 0
    tabFrame.Parent = mainFrame
    
    local tabLayout = Instance.new("UIListLayout")
    tabLayout.FillDirection = Enum.FillDirection.Horizontal
    tabLayout.SortOrder = Enum.SortOrder.LayoutOrder
    tabLayout.Parent = tabFrame
    
    -- Content frame
    local contentFrame = Instance.new("Frame")
    contentFrame.Name = "ContentFrame"
    contentFrame.Size = UDim2.new(1, 0, 1, -80)
    contentFrame.Position = UDim2.new(0, 0, 0, 80)
    contentFrame.BackgroundColor3 = Color3.fromRGB(40, 40, 40)
    contentFrame.BorderSizePixel = 0
    contentFrame.Parent = mainFrame
    
    -- Create tabs
    self:CreateTabs(tabFrame, contentFrame)
    
    -- Connect events
    closeButton.MouseButton1Click:Connect(function()
        self:ToggleGUI()
    end)
    
    -- Make draggable
    self:MakeDraggable(mainFrame, titleBar)
    
    self.GUI = screenGui
    self.MainFrame = mainFrame
    self.ContentFrame = contentFrame
end

function AdminGUI:CreateTabs(tabFrame, contentFrame)
    local tabs = {
        {Name = "Commands", Icon = "⚡"},
        {Name = "Players", Icon = "👥"},
        {Name = "Tycoons", Icon = "🏭"},
        {Name = "Territories", Icon = "🗺️"},
        {Name = "Settings", Icon = "⚙️"}
    }
    
    for i, tab in ipairs(tabs) do
        -- Tab button
        local tabButton = Instance.new("TextButton")
        tabButton.Name = tab.Name .. "Tab"
        tabButton.Size = UDim2.new(1/#tabs, 0, 1, 0)
        tabButton.Text = tab.Icon .. " " .. tab.Name
        tabButton.TextColor3 = Color3.fromRGB(200, 200, 200)
        tabButton.TextSize = 14
        tabButton.Font = Enum.Font.SourceSans
        tabButton.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
        tabButton.BorderSizePixel = 0
        tabButton.LayoutOrder = i
        tabButton.Parent = tabFrame
        
        -- Tab content
        local tabContent = Instance.new("ScrollingFrame")
        tabContent.Name = tab.Name .. "Content"
        tabContent.Size = UDim2.new(1, 0, 1, 0)
        tabContent.BackgroundTransparency = 1
        tabContent.BorderSizePixel = 0
        tabContent.ScrollBarThickness = 8
        tabContent.Visible = (i == 1) -- Show first tab by default
        tabContent.Parent = contentFrame
        
        -- Create tab-specific content
        if tab.Name == "Commands" then
            self:CreateCommandsTab(tabContent)
        elseif tab.Name == "Players" then
            self:CreatePlayersTab(tabContent)
        elseif tab.Name == "Tycoons" then
            self:CreateTycoonsTab(tabContent)
        elseif tab.Name == "Territories" then
            self:CreateTerritoriesTab(tabContent)
        elseif tab.Name == "Settings" then
            self:CreateSettingsTab(tabContent)
        end
        
        -- Tab click event
        tabButton.MouseButton1Click:Connect(function()
            self:SwitchTab(tab.Name)
        end)
    end
end

function AdminGUI:CreateCommandsTab(parent)
    local layout = Instance.new("UIListLayout")
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Padding = UDim.new(0, 5)
    layout.Parent = parent
    
    -- Command input
    local inputFrame = Instance.new("Frame")
    inputFrame.Size = UDim2.new(1, -10, 0, 40)
    inputFrame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    inputFrame.BorderSizePixel = 0
    inputFrame.LayoutOrder = 1
    inputFrame.Parent = parent
    
    local inputCorner = Instance.new("UICorner")
    inputCorner.CornerRadius = UDim.new(0, 5)
    inputCorner.Parent = inputFrame
    
    local commandInput = Instance.new("TextBox")
    commandInput.Name = "CommandInput"
    commandInput.Size = UDim2.new(1, -80, 1, 0)
    commandInput.Position = UDim2.new(0, 10, 0, 0)
    commandInput.PlaceholderText = "Enter command... (e.g., :tp player1 player2)"
    commandInput.Text = ""
    commandInput.TextColor3 = Color3.fromRGB(255, 255, 255)
    commandInput.TextSize = 14
    commandInput.Font = Enum.Font.SourceSansItalic
    commandInput.BackgroundTransparency = 1
    commandInput.TextXAlignment = Enum.TextXAlignment.Left
    commandInput.Parent = inputFrame
    
    local executeButton = Instance.new("TextButton")
    executeButton.Size = UDim2.new(0, 60, 0, 30)
    executeButton.Position = UDim2.new(1, -65, 0, 5)
    executeButton.Text = "Execute"
    executeButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    executeButton.TextSize = 12
    executeButton.Font = Enum.Font.SourceSansBold
    executeButton.BackgroundColor3 = Color3.fromRGB(0, 120, 215)
    executeButton.BorderSizePixel = 0
    executeButton.Parent = inputFrame
    
    local buttonCorner = Instance.new("UICorner")
    buttonCorner.CornerRadius = UDim.new(0, 3)
    buttonCorner.Parent = executeButton
    
    -- Quick commands
    local quickCommandsTitle = Instance.new("TextLabel")
    quickCommandsTitle.Size = UDim2.new(1, 0, 0, 25)
    quickCommandsTitle.Text = "Quick Commands:"
    quickCommandsTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
    quickCommandsTitle.TextSize = 16
    quickCommandsTitle.Font = Enum.Font.SourceSansBold
    quickCommandsTitle.BackgroundTransparency = 1
    quickCommandsTitle.TextXAlignment = Enum.TextXAlignment.Left
    quickCommandsTitle.LayoutOrder = 2
    quickCommandsTitle.Parent = parent
    
    -- Quick command buttons
    local quickCommands = self:GetQuickCommands(playerData.RankScore)
    for i, cmd in ipairs(quickCommands) do
        local cmdButton = Instance.new("TextButton")
        cmdButton.Size = UDim2.new(1, -10, 0, 35)
        cmdButton.Text = ":" .. cmd.Command .. " - " .. cmd.Description
        cmdButton.TextColor3 = Color3.fromRGB(255, 255, 255)
        cmdButton.TextSize = 14
        cmdButton.Font = Enum.Font.SourceSans
        cmdButton.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
        cmdButton.BorderSizePixel = 0
        cmdButton.TextXAlignment = Enum.TextXAlignment.Left
        cmdButton.LayoutOrder = 2 + i
        cmdButton.Parent = parent
        
        local cmdCorner = Instance.new("UICorner")
        cmdCorner.CornerRadius = UDim.new(0, 5)
        cmdCorner.Parent = cmdButton
        
        -- Click event
        cmdButton.MouseButton1Click:Connect(function()
            commandInput.Text = ":" .. cmd.Command .. " "
            commandInput:CaptureFocus()
        end)
    end
    
    -- Execute command event
    executeButton.MouseButton1Click:Connect(function()
        self:ExecuteCommand(commandInput.Text)
        commandInput.Text = ""
    end)
    
    commandInput.FocusLost:Connect(function(enterPressed)
        if enterPressed then
            self:ExecuteCommand(commandInput.Text)
            commandInput.Text = ""
        end
    end)
    
    parent.CanvasSize = UDim2.new(0, 0, 0, layout.AbsoluteContentSize.Y)
    layout.Changed:Connect(function()
        parent.CanvasSize = UDim2.new(0, 0, 0, layout.AbsoluteContentSize.Y)
    end)
end

function AdminGUI:CreatePlayersTab(parent)
    local layout = Instance.new("UIListLayout")
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Padding = UDim.new(0, 5)
    layout.Parent = parent
    
    -- Refresh button
    local refreshButton = Instance.new("TextButton")
    refreshButton.Size = UDim2.new(0, 100, 0, 30)
    refreshButton.Text = "🔄 Refresh"
    refreshButton.TextColor3 = Color3.fromRGB(255, 255, 255)
    refreshButton.TextSize = 14
    refreshButton.Font = Enum.Font.SourceSans
    refreshButton.BackgroundColor3 = Color3.fromRGB(0, 150, 0)
    refreshButton.BorderSizePixel = 0
    refreshButton.LayoutOrder = 1
    refreshButton.Parent = parent
    
    local refreshCorner = Instance.new("UICorner")
    refreshCorner.CornerRadius = UDim.new(0, 5)
    refreshCorner.Parent = refreshButton
    
    refreshButton.MouseButton1Click:Connect(function()
        self:RefreshPlayersList(parent)
    end)
    
    -- Initial player list
    self:RefreshPlayersList(parent)
end

function AdminGUI:RefreshPlayersList(parent)
    -- Clear existing players
    for _, child in pairs(parent:GetChildren()) do
        if child.Name:match("PlayerFrame") then
            child:Destroy()
        end
    end
    
    -- Add current players
    for i, plr in pairs(Players:GetPlayers()) do
        local playerFrame = Instance.new("Frame")
        playerFrame.Name = "PlayerFrame" .. i
        playerFrame.Size = UDim2.new(1, -10, 0, 50)
        playerFrame.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
        playerFrame.BorderSizePixel = 0
        playerFrame.LayoutOrder = 1 + i
        playerFrame.Parent = parent
        
        local playerCorner = Instance.new("UICorner")
        playerCorner.CornerRadius = UDim.new(0, 5)
        playerCorner.Parent = playerFrame
        
        -- Player info
        local playerLabel = Instance.new("TextLabel")
        playerLabel.Size = UDim2.new(0.7, 0, 1, 0)
        playerLabel.Text = plr.Name .. " (" .. plr.DisplayName .. ")"
        playerLabel.TextColor3 = Color3.fromRGB(255, 255, 255)
        playerLabel.TextSize = 14
        playerLabel.Font = Enum.Font.SourceSans
        playerLabel.BackgroundTransparency = 1
        playerLabel.TextXAlignment = Enum.TextXAlignment.Left
        playerLabel.Parent = playerFrame
        
        -- Action buttons
        if playerData.RankScore >= 4.5 then
            local actionLayout = Instance.new("UIListLayout")
            actionLayout.FillDirection = Enum.FillDirection.Horizontal
            actionLayout.SortOrder = Enum.SortOrder.LayoutOrder
            actionLayout.Padding = UDim.new(0, 5)
            
            local actionFrame = Instance.new("Frame")
            actionFrame.Size = UDim2.new(0.3, 0, 1, 0)
            actionFrame.Position = UDim2.new(0.7, 0, 0, 0)
            actionFrame.BackgroundTransparency = 1
            actionFrame.Parent = playerFrame
            
            actionLayout.Parent = actionFrame
            
            -- TP button
            local tpButton = Instance.new("TextButton")
            tpButton.Size = UDim2.new(0, 30, 0, 25)
            tpButton.Text = "TP"
            tpButton.TextColor3 = Color3.fromRGB(255, 255, 255)
            tpButton.TextSize = 12
            tpButton.Font = Enum.Font.SourceSans
            tpButton.BackgroundColor3 = Color3.fromRGB(0, 120, 215)
            tpButton.BorderSizePixel = 0
            tpButton.LayoutOrder = 1
            tpButton.Parent = actionFrame
            
            tpButton.MouseButton1Click:Connect(function()
                self:ExecuteCommand(":tp me " .. plr.Name)
            end)
            
            -- Kick button (if high enough rank)
            if playerData.RankScore >= 4.5 then
                local kickButton = Instance.new("TextButton")
                kickButton.Size = UDim2.new(0, 35, 0, 25)
                kickButton.Text = "Kick"
                kickButton.TextColor3 = Color3.fromRGB(255, 255, 255)
                kickButton.TextSize = 12
                kickButton.Font = Enum.Font.SourceSans
                kickButton.BackgroundColor3 = Color3.fromRGB(255, 140, 0)
                kickButton.BorderSizePixel = 0
                kickButton.LayoutOrder = 2
                kickButton.Parent = actionFrame
                
                kickButton.MouseButton1Click:Connect(function()
                    self:ExecuteCommand(":kick " .. plr.Name .. " Admin action")
                end)
            end
        end
    end
    
    parent.CanvasSize = UDim2.new(0, 0, 0, parent.UIListLayout.AbsoluteContentSize.Y)
end

function AdminGUI:GetQuickCommands(rankScore)
    local commands = {}
    
    if rankScore >= 4.0 then
        table.insert(commands, {Command = "tp", Description = "Teleport player"})
        table.insert(commands, {Command = "heal", Description = "Heal player"})
        table.insert(commands, {Command = "speed", Description = "Set player speed"})
    end
    
    if rankScore >= 4.5 then
        table.insert(commands, {Command = "kick", Description = "Kick player"})
        table.insert(commands, {Command = "warn", Description = "Warn player"})
        table.insert(commands, {Command = "give", Description = "Give item to player"})
    end
    
    if rankScore >= 4.9 then
        table.insert(commands, {Command = "ban", Description = "Ban player"})
        table.insert(commands, {Command = "rank", Description = "Change player rank"})
    end
    
    if rankScore >= 5.0 then
        table.insert(commands, {Command = "shutdown", Description = "Shutdown server"})
        table.insert(commands, {Command = "announce", Description = "Server announcement"})
    end
    
    return commands
end

function AdminGUI:ExecuteCommand(commandText)
    if commandText == "" then return end
    
    -- Send to server
    executeCommand:FireServer(commandText)
    
    print("[HD Admin] Executed command:", commandText)
end

function AdminGUI:SwitchTab(tabName)
    self.CurrentTab = tabName
    
    -- Hide all content frames
    for _, child in pairs(self.ContentFrame:GetChildren()) do
        if child.Name:match("Content$") then
            child.Visible = false
        end
    end
    
    -- Show selected tab
    local targetContent = self.ContentFrame:FindFirstChild(tabName .. "Content")
    if targetContent then
        targetContent.Visible = true
    end
    
    -- Update tab button colors
    local tabFrame = self.MainFrame:FindFirstChild("TabFrame")
    if tabFrame then
        for _, child in pairs(tabFrame:GetChildren()) do
            if child:IsA("TextButton") then
                if child.Name == tabName .. "Tab" then
                    child.BackgroundColor3 = Color3.fromRGB(0, 120, 215)
                    child.TextColor3 = Color3.fromRGB(255, 255, 255)
                else
                    child.BackgroundColor3 = Color3.fromRGB(45, 45, 45)
                    child.TextColor3 = Color3.fromRGB(200, 200, 200)
                end
            end
        end
    end
end

function AdminGUI:ToggleGUI()
    if not self.GUI then return end
    
    self.IsOpen = not self.IsOpen
    self.MainFrame.Visible = self.IsOpen
    
    if self.IsOpen then
        -- Fade in animation
        self.MainFrame.Position = UDim2.new(0.5, -250, 0.3, -200)
        local tween = TweenService:Create(self.MainFrame, 
            TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
            {Position = UDim2.new(0.5, -250, 0.5, -200)}
        )
        tween:Play()
    end
end

function AdminGUI:MakeDraggable(frame, dragArea)
    local dragging = false
    local dragStart = nil
    local startPos = nil
    
    dragArea.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = true
            dragStart = input.Position
            startPos = frame.Position
        end
    end)
    
    dragArea.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = false
        end
    end)
    
    UserInputService.InputChanged:Connect(function(input)
        if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
            local delta = input.Position - dragStart
            frame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, 
                                      startPos.Y.Scale, startPos.Y.Offset + delta.Y)
        end
    end)
end

-- Key binding to toggle GUI
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    
    if input.KeyCode == Enum.KeyCode.Semicolon then -- ; key
        AdminGUI:ToggleGUI()
    end
end)

-- Initialize GUI
AdminGUI:CreateGUI()

-- Auto-show for high rank admins
if playerData.RankScore >= 4.5 then
    wait(2) -- Wait a bit after spawn
    AdminGUI:ToggleGUI()
end