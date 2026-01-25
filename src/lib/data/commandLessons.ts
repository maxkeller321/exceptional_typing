import type { Lesson } from '../types';

/**
 * Linux Command Lessons for Coder Mode
 *
 * These lessons teach common Linux/Unix commands through typing practice.
 * Each task includes the command itself AND its description/help message.
 * Users type both the command and the explanation to reinforce learning.
 * Commands are organized from basic to advanced.
 */

export const commandLessons: Lesson[] = [
  // ============================================
  // BEGINNER: File Navigation & Basics
  // ============================================
  {
    id: 'cmd-navigation-basics',
    name: 'Navigation Basics',
    description: 'Learn essential commands for navigating the file system: pwd, ls, cd.',
    category: 'commands',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'nav-1',
        instruction: 'Type the command and its description to learn pwd.',
        targetText: 'pwd - Print Working Directory. Shows your current location in the filesystem.',
        minAccuracy: 0.9,
      },
      {
        id: 'nav-2',
        instruction: 'Type the command and its description to learn ls.',
        targetText: 'ls - List directory contents. One of the most frequently used commands.',
        minAccuracy: 0.9,
      },
      {
        id: 'nav-3',
        instruction: 'Type the command and its description to learn ls with options.',
        targetText: 'ls -la - List all files including hidden in long format with details.',
        minAccuracy: 0.9,
      },
      {
        id: 'nav-4',
        instruction: 'Type the command and its description to learn cd.',
        targetText: 'cd /home - Change directory to /home. cd without arguments goes to home.',
        minAccuracy: 0.9,
      },
      {
        id: 'nav-5',
        instruction: 'Type the command and its description to learn parent directory navigation.',
        targetText: 'cd .. - Move up one directory level. Double dot means parent directory.',
        minAccuracy: 0.9,
      },
      {
        id: 'nav-6',
        instruction: 'Type the command and its description to learn the home shortcut.',
        targetText: 'cd ~ - Go to your home directory. The tilde is a shortcut for $HOME.',
        minAccuracy: 0.9,
      },
    ],
  },

  {
    id: 'cmd-file-basics',
    name: 'File Operations Basics',
    description: 'Learn to create, copy, move, and remove files: touch, cp, mv, rm.',
    category: 'commands',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'file-1',
        instruction: 'Type the command and its description to learn touch.',
        targetText: 'touch file.txt - Create an empty file or update its timestamp.',
        minAccuracy: 0.9,
      },
      {
        id: 'file-2',
        instruction: 'Type the command and its description to learn cp.',
        targetText: 'cp source.txt dest.txt - Copy a file. Use -r flag for directories.',
        minAccuracy: 0.9,
      },
      {
        id: 'file-3',
        instruction: 'Type the command and its description to learn mv.',
        targetText: 'mv old.txt new.txt - Move or rename a file or directory.',
        minAccuracy: 0.9,
      },
      {
        id: 'file-4',
        instruction: 'Type the command and its description to learn rm.',
        targetText: 'rm file.txt - Remove a file permanently. There is no recycle bin!',
        minAccuracy: 0.9,
      },
      {
        id: 'file-5',
        instruction: 'Type the command and its description to learn mkdir.',
        targetText: 'mkdir projects - Create a new directory with the given name.',
        minAccuracy: 0.9,
      },
      {
        id: 'file-6',
        instruction: 'Type the command and its description to learn rmdir.',
        targetText: 'rmdir empty_dir - Remove an empty directory. Fails if not empty.',
        minAccuracy: 0.9,
      },
    ],
  },

  {
    id: 'cmd-reading-files',
    name: 'Reading Files',
    description: 'Learn commands to view file contents: cat, head, tail, less.',
    category: 'commands',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'read-1',
        instruction: 'Type the command and its description to learn cat.',
        targetText: 'cat file.txt - Display the entire contents of a file to stdout.',
        minAccuracy: 0.9,
      },
      {
        id: 'read-2',
        instruction: 'Type the command and its description to learn head.',
        targetText: 'head -n 10 file.txt - Show the first 10 lines of a file.',
        minAccuracy: 0.9,
      },
      {
        id: 'read-3',
        instruction: 'Type the command and its description to learn tail.',
        targetText: 'tail -n 20 file.txt - Show the last 20 lines of a file.',
        minAccuracy: 0.9,
      },
      {
        id: 'read-4',
        instruction: 'Type the command and its description to learn tail follow mode.',
        targetText: 'tail -f logfile.log - Follow a file in real-time. Great for logs.',
        minAccuracy: 0.9,
      },
      {
        id: 'read-5',
        instruction: 'Type the command and its description to learn less.',
        targetText: 'less file.txt - View file with pagination. Press q to quit.',
        minAccuracy: 0.9,
      },
      {
        id: 'read-6',
        instruction: 'Type the command and its description to learn wc.',
        targetText: 'wc -l file.txt - Count lines in a file. Use -w for words, -c for bytes.',
        minAccuracy: 0.9,
      },
    ],
  },

  // ============================================
  // INTERMEDIATE: Search & Text Processing
  // ============================================
  {
    id: 'cmd-searching',
    name: 'Search Commands',
    description: 'Learn to find files and search content: find, grep, locate.',
    category: 'commands',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'search-1',
        instruction: 'Type the command and its description to learn find with name.',
        targetText: 'find . -name "*.txt" - Find all .txt files in current directory recursively.',
        minAccuracy: 0.85,
      },
      {
        id: 'search-2',
        instruction: 'Type the command and its description to learn find with time.',
        targetText: 'find /home -type f -mtime -7 - Find files modified in the last 7 days.',
        minAccuracy: 0.85,
      },
      {
        id: 'search-3',
        instruction: 'Type the command and its description to learn basic grep.',
        targetText: 'grep "error" logfile.log - Search for the pattern "error" in a file.',
        minAccuracy: 0.85,
      },
      {
        id: 'search-4',
        instruction: 'Type the command and its description to learn recursive grep.',
        targetText: 'grep -r "TODO" ./src - Recursively search for TODO in the src directory.',
        minAccuracy: 0.85,
      },
      {
        id: 'search-5',
        instruction: 'Type the command and its description to learn case-insensitive grep.',
        targetText: 'grep -i "warning" file.txt - Case-insensitive search for warning.',
        minAccuracy: 0.85,
      },
      {
        id: 'search-6',
        instruction: 'Type the command and its description to learn grep with line numbers.',
        targetText: 'grep -n "function" *.js - Show line numbers with matching lines.',
        minAccuracy: 0.85,
      },
    ],
  },

  {
    id: 'cmd-text-processing',
    name: 'Text Processing',
    description: 'Learn text manipulation with sort, uniq, cut, and sed.',
    category: 'commands',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'text-1',
        instruction: 'Type the command and its description to learn sort.',
        targetText: 'sort file.txt - Sort lines alphabetically in ascending order.',
        minAccuracy: 0.9,
      },
      {
        id: 'text-2',
        instruction: 'Type the command and its description to learn numeric sort.',
        targetText: 'sort -n numbers.txt - Sort lines numerically instead of alphabetically.',
        minAccuracy: 0.9,
      },
      {
        id: 'text-3',
        instruction: 'Type the command and its description to learn uniq.',
        targetText: 'uniq -c sorted.txt - Count unique consecutive lines. File must be sorted.',
        minAccuracy: 0.85,
      },
      {
        id: 'text-4',
        instruction: 'Type the command and its description to learn cut.',
        targetText: 'cut -d"," -f1 data.csv - Extract the first column from a CSV file.',
        minAccuracy: 0.85,
      },
      {
        id: 'text-5',
        instruction: 'Type the command and its description to learn sed substitution.',
        targetText: 'sed "s/old/new/g" file.txt - Replace all occurrences of old with new.',
        minAccuracy: 0.85,
      },
      {
        id: 'text-6',
        instruction: 'Type the command and its description to learn awk.',
        targetText: 'awk "{print $1}" file.txt - Print the first field of each line.',
        minAccuracy: 0.85,
      },
    ],
  },

  {
    id: 'cmd-pipes-redirection',
    name: 'Pipes & Redirection',
    description: 'Learn to chain commands and redirect output: |, >, >>, <.',
    category: 'commands',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'pipe-1',
        instruction: 'Type the command and its description to learn piping.',
        targetText: 'ls -la | grep ".txt" - Pipe ls output to grep to filter for .txt files.',
        minAccuracy: 0.85,
      },
      {
        id: 'pipe-2',
        instruction: 'Type the command and its description to learn combining commands.',
        targetText: 'cat file.txt | wc -l - Count lines in a file using a pipe.',
        minAccuracy: 0.85,
      },
      {
        id: 'pipe-3',
        instruction: 'Type the command and its description to learn output redirection.',
        targetText: 'echo "Hello World" > file.txt - Redirect output to file, overwriting it.',
        minAccuracy: 0.85,
      },
      {
        id: 'pipe-4',
        instruction: 'Type the command and its description to learn append redirection.',
        targetText: 'echo "New line" >> file.txt - Append output to file without overwriting.',
        minAccuracy: 0.85,
      },
      {
        id: 'pipe-5',
        instruction: 'Type the command and its description to learn input redirection.',
        targetText: 'sort < unsorted.txt > sorted.txt - Input from file, output to another.',
        minAccuracy: 0.85,
      },
      {
        id: 'pipe-6',
        instruction: 'Type the command and its description to learn stderr redirection.',
        targetText: 'command 2>&1 | tee output.log - Capture stdout and stderr to file.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // INTERMEDIATE: System Information
  // ============================================
  {
    id: 'cmd-system-info',
    name: 'System Information',
    description: 'Learn commands to check system status: ps, top, df, du, free.',
    category: 'commands',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'sys-1',
        instruction: 'Type the command and its description to learn ps.',
        targetText: 'ps aux - List all running processes with detailed information.',
        minAccuracy: 0.9,
      },
      {
        id: 'sys-2',
        instruction: 'Type the command and its description to learn top.',
        targetText: 'top - Interactive process viewer showing CPU and memory usage. Press q to quit.',
        minAccuracy: 0.85,
      },
      {
        id: 'sys-3',
        instruction: 'Type the command and its description to learn htop.',
        targetText: 'htop - Enhanced interactive process viewer with better UI. Requires install.',
        minAccuracy: 0.85,
      },
      {
        id: 'sys-4',
        instruction: 'Type the command and its description to learn df.',
        targetText: 'df -h - Show disk space usage in human-readable format like GB and MB.',
        minAccuracy: 0.85,
      },
      {
        id: 'sys-5',
        instruction: 'Type the command and its description to learn du.',
        targetText: 'du -sh ./folder - Show total size of a directory in human-readable format.',
        minAccuracy: 0.85,
      },
      {
        id: 'sys-6',
        instruction: 'Type the command and its description to learn free.',
        targetText: 'free -h - Display memory usage including RAM and swap in human-readable format.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // ADVANCED: Permissions & Users
  // ============================================
  {
    id: 'cmd-permissions',
    name: 'File Permissions',
    description: 'Learn to manage file permissions: chmod, chown, chgrp.',
    category: 'commands',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'perm-1',
        instruction: 'Type the command and its description to learn chmod with octal.',
        targetText: 'chmod 755 script.sh - Set permissions to rwxr-xr-x. Owner can do all, others read/execute.',
        minAccuracy: 0.85,
      },
      {
        id: 'perm-2',
        instruction: 'Type the command and its description to learn chmod with symbolic.',
        targetText: 'chmod +x script.sh - Add execute permission for all users on the file.',
        minAccuracy: 0.85,
      },
      {
        id: 'perm-3',
        instruction: 'Type the command and its description to learn fine-grained chmod.',
        targetText: 'chmod u+rw,g+r,o-rwx file.txt - User read/write, group read, others nothing.',
        minAccuracy: 0.85,
      },
      {
        id: 'perm-4',
        instruction: 'Type the command and its description to learn chown.',
        targetText: 'chown user:group file.txt - Change file owner to user and group to group.',
        minAccuracy: 0.85,
      },
      {
        id: 'perm-5',
        instruction: 'Type the command and its description to learn recursive chown.',
        targetText: 'chown -R user:group ./dir - Recursively change ownership of directory and contents.',
        minAccuracy: 0.85,
      },
      {
        id: 'perm-6',
        instruction: 'Type the command and its description to learn stat.',
        targetText: 'stat file.txt - Display detailed file info including permissions, size, and timestamps.',
        minAccuracy: 0.85,
      },
    ],
  },

  {
    id: 'cmd-user-management',
    name: 'User Management',
    description: 'Learn commands for user and group management.',
    category: 'commands',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'user-1',
        instruction: 'Type the command and its description to learn whoami.',
        targetText: 'whoami - Display the username of the current logged-in user.',
        minAccuracy: 0.9,
      },
      {
        id: 'user-2',
        instruction: 'Type the command and its description to learn id.',
        targetText: 'id - Display current user ID, group ID, and all group memberships.',
        minAccuracy: 0.9,
      },
      {
        id: 'user-3',
        instruction: 'Type the command and its description to learn useradd.',
        targetText: 'sudo useradd -m newuser - Create new user with home directory. Requires root.',
        minAccuracy: 0.85,
      },
      {
        id: 'user-4',
        instruction: 'Type the command and its description to learn passwd.',
        targetText: 'sudo passwd username - Set or change password for specified user account.',
        minAccuracy: 0.85,
      },
      {
        id: 'user-5',
        instruction: 'Type the command and its description to learn groups.',
        targetText: 'groups username - Show all groups that the specified user belongs to.',
        minAccuracy: 0.85,
      },
      {
        id: 'user-6',
        instruction: 'Type the command and its description to learn usermod.',
        targetText: 'sudo usermod -aG docker user - Add user to docker group. -a means append.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // ADVANCED: Networking
  // ============================================
  {
    id: 'cmd-networking',
    name: 'Network Commands',
    description: 'Learn essential networking commands: ping, curl, wget, ssh.',
    category: 'commands',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'net-1',
        instruction: 'Type the command and its description to learn ping.',
        targetText: 'ping -c 4 google.com - Send 4 ICMP packets to test network connectivity.',
        minAccuracy: 0.85,
      },
      {
        id: 'net-2',
        instruction: 'Type the command and its description to learn curl.',
        targetText: 'curl https://api.example.com - Make HTTP request and display response body.',
        minAccuracy: 0.85,
      },
      {
        id: 'net-3',
        instruction: 'Type the command and its description to learn curl download.',
        targetText: 'curl -o file.zip https://example.com/file.zip - Download file and save to disk.',
        minAccuracy: 0.85,
      },
      {
        id: 'net-4',
        instruction: 'Type the command and its description to learn wget.',
        targetText: 'wget https://example.com/file.tar.gz - Download file. Resumes interrupted downloads.',
        minAccuracy: 0.85,
      },
      {
        id: 'net-5',
        instruction: 'Type the command and its description to learn ssh.',
        targetText: 'ssh user@hostname - Connect securely to remote server via SSH protocol.',
        minAccuracy: 0.85,
      },
      {
        id: 'net-6',
        instruction: 'Type the command and its description to learn scp.',
        targetText: 'scp file.txt user@host:/path/ - Securely copy files to remote server over SSH.',
        minAccuracy: 0.85,
      },
    ],
  },

  {
    id: 'cmd-network-diagnostics',
    name: 'Network Diagnostics',
    description: 'Learn commands for network troubleshooting: netstat, ss, ip, nmap.',
    category: 'commands',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'diag-1',
        instruction: 'Type the command and its description to learn ip addr.',
        targetText: 'ip addr show - Display all network interfaces and their IP addresses.',
        minAccuracy: 0.85,
      },
      {
        id: 'diag-2',
        instruction: 'Type the command and its description to learn ss.',
        targetText: 'ss -tuln - List all listening TCP and UDP ports with numeric addresses.',
        minAccuracy: 0.85,
      },
      {
        id: 'diag-3',
        instruction: 'Type the command and its description to learn netstat.',
        targetText: 'netstat -an | grep LISTEN - Show all listening ports. Works on older systems.',
        minAccuracy: 0.85,
      },
      {
        id: 'diag-4',
        instruction: 'Type the command and its description to learn traceroute.',
        targetText: 'traceroute google.com - Trace the network path packets take to destination.',
        minAccuracy: 0.85,
      },
      {
        id: 'diag-5',
        instruction: 'Type the command and its description to learn dig.',
        targetText: 'dig example.com - Query DNS servers for domain information and records.',
        minAccuracy: 0.85,
      },
      {
        id: 'diag-6',
        instruction: 'Type the command and its description to learn nslookup.',
        targetText: 'nslookup example.com - Query DNS to find IP address of a domain name.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // ADVANCED: Archives & Compression
  // ============================================
  {
    id: 'cmd-archives',
    name: 'Archives & Compression',
    description: 'Learn to create and extract archives: tar, gzip, zip.',
    category: 'commands',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'arch-1',
        instruction: 'Type the command and its description to learn tar create.',
        targetText: 'tar -cvf archive.tar ./folder - Create tar archive. c=create, v=verbose, f=file.',
        minAccuracy: 0.85,
      },
      {
        id: 'arch-2',
        instruction: 'Type the command and its description to learn tar extract.',
        targetText: 'tar -xvf archive.tar - Extract tar archive. x=extract, v=verbose, f=file.',
        minAccuracy: 0.85,
      },
      {
        id: 'arch-3',
        instruction: 'Type the command and its description to learn tar with gzip.',
        targetText: 'tar -czvf archive.tar.gz ./folder - Create gzip compressed archive. z=gzip.',
        minAccuracy: 0.85,
      },
      {
        id: 'arch-4',
        instruction: 'Type the command and its description to learn tar extract gzip.',
        targetText: 'tar -xzvf archive.tar.gz - Extract gzip compressed tar archive.',
        minAccuracy: 0.85,
      },
      {
        id: 'arch-5',
        instruction: 'Type the command and its description to learn zip.',
        targetText: 'zip -r archive.zip ./folder - Create zip archive recursively from folder.',
        minAccuracy: 0.85,
      },
      {
        id: 'arch-6',
        instruction: 'Type the command and its description to learn unzip.',
        targetText: 'unzip archive.zip -d ./output - Extract zip archive to specified directory.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // EXPERT: Process Management
  // ============================================
  {
    id: 'cmd-process-management',
    name: 'Process Management',
    description: 'Learn advanced process control: kill, pkill, nohup, jobs, bg, fg.',
    category: 'commands',
    difficulty: 'expert',
    tasks: [
      {
        id: 'proc-1',
        instruction: 'Type the command and its description to learn kill.',
        targetText: 'kill 1234 - Send SIGTERM signal to process ID 1234. Allows graceful shutdown.',
        minAccuracy: 0.85,
      },
      {
        id: 'proc-2',
        instruction: 'Type the command and its description to learn kill -9.',
        targetText: 'kill -9 1234 - Send SIGKILL to force kill process. Cannot be ignored by process.',
        minAccuracy: 0.85,
      },
      {
        id: 'proc-3',
        instruction: 'Type the command and its description to learn pkill.',
        targetText: 'pkill -f "python script.py" - Kill all processes matching the pattern.',
        minAccuracy: 0.85,
      },
      {
        id: 'proc-4',
        instruction: 'Type the command and its description to learn nohup.',
        targetText: 'nohup ./script.sh & - Run command immune to hangups. & puts it in background.',
        minAccuracy: 0.85,
      },
      {
        id: 'proc-5',
        instruction: 'Type the command and its description to learn jobs.',
        targetText: 'jobs - List all background jobs running in the current shell session.',
        minAccuracy: 0.85,
      },
      {
        id: 'proc-6',
        instruction: 'Type the command and its description to learn fg.',
        targetText: 'fg %1 - Bring background job number 1 to foreground for interaction.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // INTERMEDIATE: Git Commands
  // ============================================
  {
    id: 'cmd-git-basics',
    name: 'Git Basics',
    description: 'Learn essential Git commands for version control.',
    category: 'commands',
    difficulty: 'intermediate',
    tasks: [
      {
        id: 'git-1',
        instruction: 'Type the command and its description to learn git init.',
        targetText: 'git init - Initialize a new Git repository in the current directory.',
        minAccuracy: 0.9,
      },
      {
        id: 'git-2',
        instruction: 'Type the command and its description to learn git clone.',
        targetText: 'git clone https://github.com/user/repo.git - Clone remote repository locally.',
        minAccuracy: 0.85,
      },
      {
        id: 'git-3',
        instruction: 'Type the command and its description to learn git status.',
        targetText: 'git status - Show working tree status: modified, staged, and untracked files.',
        minAccuracy: 0.85,
      },
      {
        id: 'git-4',
        instruction: 'Type the command and its description to learn git add.',
        targetText: 'git add . - Stage all changes in current directory for the next commit.',
        minAccuracy: 0.9,
      },
      {
        id: 'git-5',
        instruction: 'Type the command and its description to learn git commit.',
        targetText: 'git commit -m "Initial commit" - Create commit with message describing changes.',
        minAccuracy: 0.85,
      },
      {
        id: 'git-6',
        instruction: 'Type the command and its description to learn git push.',
        targetText: 'git push origin main - Push local commits to remote repository on main branch.',
        minAccuracy: 0.85,
      },
    ],
  },

  {
    id: 'cmd-git-advanced',
    name: 'Git Advanced',
    description: 'Learn advanced Git commands for branching and history.',
    category: 'commands',
    difficulty: 'expert',
    tasks: [
      {
        id: 'gitadv-1',
        instruction: 'Type the command and its description to learn git branch.',
        targetText: 'git branch feature/new-feature - Create a new branch without switching to it.',
        minAccuracy: 0.85,
      },
      {
        id: 'gitadv-2',
        instruction: 'Type the command and its description to learn git checkout -b.',
        targetText: 'git checkout -b feature/login - Create new branch and switch to it immediately.',
        minAccuracy: 0.85,
      },
      {
        id: 'gitadv-3',
        instruction: 'Type the command and its description to learn git merge.',
        targetText: 'git merge feature/login - Merge specified branch into current branch.',
        minAccuracy: 0.85,
      },
      {
        id: 'gitadv-4',
        instruction: 'Type the command and its description to learn git rebase.',
        targetText: 'git rebase main - Rebase current branch onto main. Replays commits on top.',
        minAccuracy: 0.85,
      },
      {
        id: 'gitadv-5',
        instruction: 'Type the command and its description to learn git log graph.',
        targetText: 'git log --oneline --graph --all - Visualize branch history as ASCII graph.',
        minAccuracy: 0.85,
      },
      {
        id: 'gitadv-6',
        instruction: 'Type the command and its description to learn git stash.',
        targetText: 'git stash && git stash pop - Save changes temporarily, then restore them later.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // ADVANCED: Docker Commands
  // ============================================
  {
    id: 'cmd-docker-basics',
    name: 'Docker Basics',
    description: 'Learn essential Docker commands for containerization.',
    category: 'commands',
    difficulty: 'advanced',
    tasks: [
      {
        id: 'docker-1',
        instruction: 'Type the command and its description to learn docker pull.',
        targetText: 'docker pull nginx - Download container image from Docker Hub registry.',
        minAccuracy: 0.85,
      },
      {
        id: 'docker-2',
        instruction: 'Type the command and its description to learn docker images.',
        targetText: 'docker images - List all downloaded images with size and creation date.',
        minAccuracy: 0.85,
      },
      {
        id: 'docker-3',
        instruction: 'Type the command and its description to learn docker run.',
        targetText: 'docker run -d -p 80:80 nginx - Run container detached, mapping port 80.',
        minAccuracy: 0.85,
      },
      {
        id: 'docker-4',
        instruction: 'Type the command and its description to learn docker ps.',
        targetText: 'docker ps -a - List all containers including stopped ones with status.',
        minAccuracy: 0.85,
      },
      {
        id: 'docker-5',
        instruction: 'Type the command and its description to learn docker exec.',
        targetText: 'docker exec -it container_id /bin/bash - Enter running container interactively.',
        minAccuracy: 0.85,
      },
      {
        id: 'docker-6',
        instruction: 'Type the command and its description to learn docker-compose.',
        targetText: 'docker-compose up -d - Start all services defined in docker-compose.yml.',
        minAccuracy: 0.85,
      },
    ],
  },

  {
    id: 'cmd-docker-advanced',
    name: 'Docker Advanced',
    description: 'Learn advanced Docker commands for image building and management.',
    category: 'commands',
    difficulty: 'expert',
    tasks: [
      {
        id: 'dockeradv-1',
        instruction: 'Type the command and its description to learn docker build.',
        targetText: 'docker build -t myapp:latest . - Build image from Dockerfile in current directory.',
        minAccuracy: 0.85,
      },
      {
        id: 'dockeradv-2',
        instruction: 'Type the command and its description to learn docker logs.',
        targetText: 'docker logs -f container_id - Follow container logs in real-time like tail -f.',
        minAccuracy: 0.85,
      },
      {
        id: 'dockeradv-3',
        instruction: 'Type the command and its description to learn docker system prune.',
        targetText: 'docker system prune -a - Remove all unused images, containers, and networks.',
        minAccuracy: 0.85,
      },
      {
        id: 'dockeradv-4',
        instruction: 'Type the command and its description to learn docker network.',
        targetText: 'docker network create mynetwork - Create custom network for container communication.',
        minAccuracy: 0.85,
      },
      {
        id: 'dockeradv-5',
        instruction: 'Type the command and its description to learn docker volume.',
        targetText: 'docker volume create mydata - Create named volume for persistent data storage.',
        minAccuracy: 0.85,
      },
      {
        id: 'dockeradv-6',
        instruction: 'Type the command and its description to learn volume mounting.',
        targetText: 'docker run -v mydata:/app/data myapp - Mount named volume into container path.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // BEGINNER: Help & Documentation
  // ============================================
  {
    id: 'cmd-help-system',
    name: 'Help & Documentation',
    description: 'Learn to use the help system: man, --help, info, apropos.',
    category: 'commands',
    difficulty: 'beginner',
    tasks: [
      {
        id: 'help-1',
        instruction: 'Type the command and its description to learn man.',
        targetText: 'man ls - Read the manual page for ls command. Press q to quit.',
        minAccuracy: 0.9,
      },
      {
        id: 'help-2',
        instruction: 'Type the command and its description to learn --help.',
        targetText: 'ls --help - Show quick help summary for ls command options.',
        minAccuracy: 0.9,
      },
      {
        id: 'help-3',
        instruction: 'Type the command and its description to learn apropos.',
        targetText: 'apropos "copy files" - Search man page descriptions for matching keywords.',
        minAccuracy: 0.85,
      },
      {
        id: 'help-4',
        instruction: 'Type the command and its description to learn whatis.',
        targetText: 'whatis grep - Display one-line description from the manual page.',
        minAccuracy: 0.9,
      },
      {
        id: 'help-5',
        instruction: 'Type the command and its description to learn type.',
        targetText: 'type ls - Show if command is builtin, alias, function, or external file.',
        minAccuracy: 0.9,
      },
      {
        id: 'help-6',
        instruction: 'Type the command and its description to learn which.',
        targetText: 'which python - Show the full filesystem path of the command executable.',
        minAccuracy: 0.9,
      },
    ],
  },

  // ============================================
  // EXPERT: Man Page Excerpts (Typing Practice)
  // ============================================
  {
    id: 'cmd-man-excerpts',
    name: 'Man Page Excerpts',
    description: 'Practice typing real man page content to learn command documentation style.',
    category: 'commands',
    difficulty: 'expert',
    tasks: [
      {
        id: 'man-1',
        instruction: 'Type this description from the grep man page.',
        targetText: 'grep - print lines that match patterns. Searches for PATTERNS in each FILE and prints each matching line.',
        minAccuracy: 0.85,
      },
      {
        id: 'man-2',
        instruction: 'Type this description of ls options.',
        targetText: 'ls options: -l use long listing format, -a include hidden files, -h print sizes in human readable format.',
        minAccuracy: 0.85,
      },
      {
        id: 'man-3',
        instruction: 'Type this description from the chmod man page.',
        targetText: 'chmod - change file mode bits. Mode can be symbolic like u+x or octal like 755.',
        minAccuracy: 0.85,
      },
      {
        id: 'man-4',
        instruction: 'Type this description from the find man page.',
        targetText: 'find - search for files in directory hierarchy. Evaluates expression for each file found.',
        minAccuracy: 0.85,
      },
      {
        id: 'man-5',
        instruction: 'Type this description from the tar man page.',
        targetText: 'tar - store and extract files from archive. Use c to create, x to extract, t to list contents.',
        minAccuracy: 0.85,
      },
      {
        id: 'man-6',
        instruction: 'Type this description from the ssh man page.',
        targetText: 'ssh - secure shell client for remote login. Provides encrypted communication between hosts.',
        minAccuracy: 0.85,
      },
    ],
  },

  // ============================================
  // EXPERT: Combined Pipeline Practice
  // ============================================
  {
    id: 'cmd-pipeline-mastery',
    name: 'Pipeline Mastery',
    description: 'Practice complex command pipelines used by experienced developers.',
    category: 'commands',
    difficulty: 'expert',
    tasks: [
      {
        id: 'pipeline-1',
        instruction: 'Type this pipeline that finds the 10 largest files.',
        targetText: 'find . -type f -exec du -h {} + | sort -rh | head -10 - Find and list 10 largest files.',
        minAccuracy: 0.8,
      },
      {
        id: 'pipeline-2',
        instruction: 'Type this pipeline that counts unique IP addresses.',
        targetText: 'cat access.log | awk "{print $1}" | sort | uniq -c | sort -rn - Count unique IPs.',
        minAccuracy: 0.8,
      },
      {
        id: 'pipeline-3',
        instruction: 'Type this pipeline that counts TODO comments.',
        targetText: 'grep -rn "TODO" --include="*.js" ./src | wc -l - Count TODO comments in JS files.',
        minAccuracy: 0.8,
      },
      {
        id: 'pipeline-4',
        instruction: 'Type this pipeline that watches logs for errors.',
        targetText: 'tail -f /var/log/app.log | grep --line-buffered "ERROR" - Watch logs for errors.',
        minAccuracy: 0.8,
      },
      {
        id: 'pipeline-5',
        instruction: 'Type this pipeline that deletes node_modules directories.',
        targetText: 'find . -name "node_modules" -type d -prune -exec rm -rf {} + - Delete all node_modules.',
        minAccuracy: 0.8,
      },
      {
        id: 'pipeline-6',
        instruction: 'Type this pipeline that calculates process memory usage.',
        targetText: 'ps aux | grep "node" | awk "{sum += $6} END {print sum/1024}" - Sum node memory in MB.',
        minAccuracy: 0.8,
      },
    ],
  },
];

export function getCommandLessonsByDifficulty(difficulty: string): Lesson[] {
  return commandLessons.filter((l) => l.difficulty === difficulty);
}

export function getCommandLessonById(id: string): Lesson | undefined {
  return commandLessons.find((l) => l.id === id);
}
