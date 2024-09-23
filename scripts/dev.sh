#!/bin/bash

# Function to switch to a tmux window
switch_window() {
    local window_number=$1
    tmux select-window -t eat-while-pregnant-dev:$window_number
}

# Function to display the menu and handle selection
show_menu() {
    clear  # Clear the screen before showing the menu
    local selection=$(echo -e "0: Web App (Remix)\n1: DB Studio\n2: DB Turso\n3: Interactive Shell\nq: Quit" | fzf --prompt="Select a window: " --height=10 --layout=reverse --border)
    
    case $selection in
        "0: Web App (Remix)") switch_window 0 ;;
        "1: DB Studio") switch_window 1 ;;
        "2: DB Turso") switch_window 2 ;;
        "3: Interactive Shell") switch_window 3 ;;

        "q: Quit") 
            tmux kill-session -t eat-while-pregnant-dev
            exit 0 
            ;;
    esac
}

# Start a new tmux session named 'eat-while-pregnant-dev'
tmux new-session -d -s eat-while-pregnant-dev

# Set tmux options
tmux set-option -g prefix C-a
tmux bind-key C-a send-prefix
tmux set-option -g mouse on
tmux set-option -g history-limit 50000
tmux set-window-option -g mode-keys vi

# Set easier window navigation shortcuts
tmux bind-key -n Left select-window -t :-
tmux bind-key -n Right select-window -t :+

# Bind 'Home' key to switch to the menu window
tmux bind-key -n Home select-window -t :=3

# Configure status bar
tmux set-option -g status-style bg=black,fg=white
tmux set-option -g status-left "#[fg=green](#S) "
tmux set-option -g status-right "#[fg=yellow]#(whoami)@#H #[fg=white]%H:%M#[default]"

# Create a new window for Web App (Remix)
tmux rename-window -t eat-while-pregnant-dev:0 'web'
tmux send-keys -t eat-while-pregnant-dev:0 'make web-dev' C-m

# Rename the first window to 'db-studio'
tmux new-window -t eat-while-pregnant-dev:1 -n 'db-studio'
tmux send-keys -t eat-while-pregnant-dev:1 'make db-studio' C-m

# Create a new window for DB Turso
tmux new-window -t eat-while-pregnant-dev:2 -n 'db-turso'
tmux send-keys -t eat-while-pregnant-dev:2 'make db-start' C-m

# Create a new window for the interactive shell
tmux new-window -t eat-while-pregnant-dev:3 -n 'interactive'
tmux send-keys -t eat-while-pregnant-dev:3 'clear; echo -e "\n\n\033[1mWelcome to the interactive shell. Type your commands here.\033[0m\n"' C-m

# Create a new window for the menu
tmux new-window -t eat-while-pregnant-dev:4 -n 'menu'
tmux send-keys -t eat-while-pregnant-dev:4 "while true; do $(declare -f switch_window show_menu); show_menu; done" C-m

# Select the menu window
tmux select-window -t eat-while-pregnant-dev:4

# Attach to the tmux session
tmux attach-session -t eat-while-pregnant-dev