const fs = require('fs');
const os = require('os');
const log = require('electron-log');
const Store = require('electron-store');
const ObsidianSession = require('./ws_session');
const uiupdater = require('./wsui_updater');
const IconService = require('icon-sdk-js');
const { remote } = require('electron');
const settings = new Store({ name: 'Settings' });
const sessConfig = { debug: remote.app.debug, walletConfig: remote.app.walletConfig };
const wsession = new ObsidianSession(sessConfig);

const ERROR_WALLET_CREATE = 'Wallet can not be created, please check your input and try again';
const ERROR_PASSWORD_FORMAT = 'Password must be at least 8 characters long and contain a combination of letters, numbers, and special characters. (?!:.,%+-/*<>{}()[]`"\'~_^\\|@#$&)';

var ObsidianManager = function ()
{
    if (!(this instanceof ObsidianManager)) {
        return new ObsidianManager();
    }

    this.iconNetworks = [
        {desc: "None", url: "unknown", tracker: "", nid: 0},
        {desc: "Mainnet", url: "https://ctz.solidwallet.io", tracker: "https://tracker.icon.foundation", nid: 1},
        {desc: "Testnet for Exchanges (Euljiro)", url: "https://test-ctz.solidwallet.io", tracker: "https://trackerdev.icon.foundation", nid: 2},
        {desc: "Testnet for DApps (Yeouido)", url: "https://bicon.net.solidwallet.io", tracker: "https://bicon.tracker.solidwallet.io", nid: 3}
    ];
};

ObsidianManager.prototype._reinitSession = function () {
    this._wipeConfig();
    wsession.reset();
    this.notifyUpdate({
        type: 'sectionChanged',
        data: 'reset-oy'
    });
};

ObsidianManager.prototype._wipeConfig = function () {
    try { fs.unlinkSync(wsession.get('walletConfig')); } catch (e) { }
};

ObsidianManager.prototype.startService = function ()
{
    wsession.set ('loadedWalletAddress', 'cx87fda925272496ae3f0bdeb551dad8fd29e0c7cf');
    wsession.set ('serviceReady', true);
};

function check_password (password) {
    return /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[?!:\.,%+-/*<>{}\(\)\[\]`"'~_^\\|@#$&]).{8,}$/.test(password)
}

ObsidianManager.prototype.createWallet = function (walletFile, password)
{
    return new Promise ((resolve, reject) => {

        if (!check_password (password)) {
            return reject (new Error (ERROR_PASSWORD_FORMAT));
        }

        // Generate a wallet
        const wallet = new IconService.IconWallet.create();
        const keystore = wallet.store (password);

        // Write keystore to disk
        fs.writeFile (walletFile, JSON.stringify (keystore), function(err) {
            if (err) {
                return reject (new Error (ERROR_WALLET_CREATE));
            }
        });

        return resolve(walletFile);
    });
};

ObsidianManager.prototype.createTransaction = function (tx, transactionFile, walletFile, walletPass)
{
    return new Promise ((resolve, reject) => {

        // Open the wallet
        try {
            // Wallets may have been saved in UTF-8 format for unknown reasons, thus we need to remove the BOM header
            const keystore = JSON.parse (fs.readFileSync (walletFile, 'utf8').replace(/^\uFEFF/, ''));
            const wallet = IconService.IconWallet.loadKeystore (keystore, walletPass);

            const icxTransaction = new IconService.IconBuilder.IcxTransactionBuilder()
                .from(tx.from)
                .to(tx.to)
                .value(tx.value)
                .stepLimit(tx.stepLimit)
                .nid(tx.nid)
                .nonce(tx.nonce)
                .version(tx.version)
                .timestamp(tx.timestamp)
                .build();

            const signature = new IconService.SignedTransaction (icxTransaction, wallet).getProperties();

            // Write transaction to disk
            fs.writeFile (transactionFile, JSON.stringify(signature), function(err) {
                if (err) {
                    return reject(err);
                }
            }); 

            return resolve (transactionFile);

        } catch (err) {
            return reject (err);
        }
    });
};

ObsidianManager.prototype.importFromKeys = function (walletFile, password, privateKey)
{
    return new Promise((resolve, reject) =>
    {
        if (!check_password (password)) {
            return reject (new Error (ERROR_PASSWORD_FORMAT));
        }

        const wallet = IconService.IconWallet.loadPrivateKey (privateKey);
        const keystore = wallet.store (password);

        // Write keystore to disk
        fs.writeFile (walletFile, JSON.stringify (keystore), function(err) {
            if (err) {
                return reject (new Error (ERROR_WALLET_CREATE));
            }
        });

        return resolve (walletFile);
    });
};

ObsidianManager.prototype.getSecretKeys = function (walletPass)
{
    return new Promise((resolve, reject) => {
        try {
            const walletFile = settings.get ('recentWallet');
            const keystore = JSON.parse (fs.readFileSync (walletFile, 'utf8').replace(/^\uFEFF/, ''));
            const wallet = IconService.IconWallet.loadKeystore (keystore, walletPass);
            return resolve (wallet.getPrivateKey());
        } catch (err) {
            return reject (err);
        }
    });
};

ObsidianManager.prototype.sendSignedTransaction = function (tx)
{
    let mgr = this;

    return new Promise((resolve, reject) => {
        try {
            let nid = parseInt(tx.nid, 16);
            let url = mgr.iconNetworks[nid].url;
            const httpProvider = new IconService.HttpProvider (url + "/api/v3");
            const iconService = new IconService (httpProvider);
            txHash = iconService.sendTransaction (tx).execute();
            return resolve (txHash);
        } catch (err) {
            return reject(err);
        }
    });
};

ObsidianManager.prototype.notifyUpdate = function (msg) {
    uiupdater.updateUiState(msg);
};

ObsidianManager.prototype.getBalance = function (address, nid)
{
    let mgr = this;

    return new Promise ((resolve, reject) => {
        try {
            let url = mgr.iconNetworks[nid].url;
            const httpProvider = new IconService.HttpProvider (url + "/api/v3");
            const iconService = new IconService (httpProvider);
            const balance = iconService.getBalance (address).execute();
            return resolve (balance);
        } catch (err) {
            console.log("[getBalance] err : ", err);
            return reject (err);
        }
    });
};

ObsidianManager.prototype.resetState = function () {
    return this._reinitSession();
};

module.exports = ObsidianManager;
