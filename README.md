<p align="center">
  <img 
    src="build/icon.png" 
    width="120px"
    alt="ICONation logo">
</p>

<h1 align="center">Obsidian - ICONation MultiSig GUI Wallet</h1>

<p align="center">
  <img 
    src="https://i.imgur.com/8KLXsRR.png"
    width="500px"
    alt="Obsidian Screens">
</p>

 [![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Download &amp; Run Obsidian

#### Windows:
1. Download the latest installer here: https://github.com/ICONation/obsidian/releases/latest
2. Run the installer `Obsidian-<version>-win-setup.exe`.

#### macOS
1. Download latest archive here: https://github.com/ICONation/obsidian/releases/latest
2. Extract `Obsidian-<version>-mac.zip` and run `Obsidian.app` inside.

## Building/Packaging Obsidian

#### Windows

- Install Chocolatey : https://chocolatey.org/docs/installation

- Install Node (Admin Powershell/cmd) :

```console
choco install nodejs -y
```

- Install Git (Admin Powershell/cmd) :

```console
choco install git -y
```

- Restart a new Powershell/CMD window

- Download Obsidian source code :

```console
git clone https://github.com/iconation/Obsidian.git
cd Obsidian
```

- Build Obsidian :

```console
npm install
npm run debug
```

- Package Obsidian :

```console
npm run dist
```

#### macOS

- Install XCode : 
https://itunes.apple.com/us/app/xcode/id497799835?mt=12

- Install Homebrew : 

```console
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

- Install Node :

```console
brew install node
```

- Install Git :

```console
brew install git
```

- Download Obsidian source code :

```console
git clone https://github.com/iconation/Obsidian.git && cd Obsidian
```

- Build Obsidian :

```console
npm install && npm run debug
```

- Package Obsidian :

```console
npm run dist
```
