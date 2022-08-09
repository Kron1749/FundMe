import { ethers } from "./ethers-5.6.esm.min.js"
import { ABI, CONTRACT_ADDRESS } from "./constants.js"
const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const getBalanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
getBalanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        await window.ethereum.request({ method: "eth_requestAccounts" })
        connectButton.innerHTML = "Connected"
    } else {
        connectButton.innerHTML = "Please install metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(CONTRACT_ADDRESS)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund(ethAmount) {
    ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        try {
            const trxResponse = await contract.fund({ value: ethers.utils.parseEther(ethAmount) })
            await listenForTrxMined(trxResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer)
        try {
            const trxResponse = await contract.withdraw()
            await listenForTrxMined(trxResponse, provider)
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTrxMined(trxReponse, provider) {
    return new Promise((resolve, reject) => {
        provider.once(trxReponse.hash, (trxReceipt) => {
            console.log(`Completed with ${trxReceipt.confirmations} confirmations. `)
            resolve()
        })
    })
}
