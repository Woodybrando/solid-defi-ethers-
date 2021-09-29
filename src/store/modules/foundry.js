import { ethers } from "ethers";
import abiSolidFoundry from '@/abi/SolidFoundry.json'
import abiDaiErc20 from '@/abi/DaiErc20.json'
// import abiWrapEthErc20 from '@/abi/WrapEthErc20.json'
// import abiMaticEscrow from '@/abi/MaticEscrow.json'
// import abiSolidEscrow from '@/abi/SolidEscrow.json'
// import abiMaticErc20 from '@/abi/MaticErc20.json'
import abiEthErc20 from '@/abi/EthErc20.json'

// const ADDR_MATIC_ESCROW = '0x7fB34A69B92eE66673e5bC4D1908ABa257e60648'
// const ADDR_SOLID_ESCROW = '0x27662EC00573DcA447F5F2c50Af1724B63679b29'
// const ADDR_MATIC_ERC20 = '0x498E0A753840075c4925442D4d8863eEe49D61E2'
// const ADDR_WRAPETH_ERC20 = '0x5F47652b0C1c4AC484D00F15F9d6a9e8db4413e5'
const ADDR_ETH_ERC20 = '0x5011D48D4265b6fB8228600a111b2fAa1fDA3139'
const ADDR_SOLID_FOUNDRY = '0xd445a3bd4fd38ab22021f95eddf18a62d0f86c43'
const ADDR_DAI_ERC20 = '0x40ef836B1B8418F3ad17f7fA07eFE7c8dBBdC147'

function divideBy18 (amt) {
  let etherValue = amt / 10 ** 18;
  // let toFixed = Number(etherValue).toFixed(2)

  return etherValue
}

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();


const state = {
  account: null,
  ethBalance: 0,
  approve: null,
  daiBalance: 12,
  foundryTotalSupply: 0,
  solidDaiBalance: 12,
  contracts: {
    solidFoundry: null,
    daiErc20: null,
    // wrapEthErc20: null,
    // maticEscrow: null,
    // solidEscrow: null,
    // maticErc20: null,
    ethErc20: null
  },
}

const getters = {
  getCurrentAcccount (state) {
    return state.account;
  },
  getEthBalance (state) {
    return state.ethBalance;
  },
  getDaiBalance (state) {
    return state.daiBalance;
  },
  getSolidDaiSupply (state) {
    return state.foundryTotalSupply;
  },
  getSolidDaiBalance (state) {
    return state.solidDaiBalance;
  },
  getApproveValue (state) {
    return state.approve
  }
}

const actions = {
  async connect ({ commit }) {
    let currentAddress = await signer.getAddress();

    let ethBalance = await provider.getBalance(currentAddress)
    ethBalance = ethBalance / 10 ** 18

    commit('set_account', currentAddress)
    commit('set_balance', ethBalance)
  },
  approveMintOnBuy ({ state, commit }) {
    const billDai = ethers.utils.parseUnits("1000000000.0", 18);
    const daiWithSigner = state.contracts.daiErc20.connect(signer);
    const approvalDai = daiWithSigner.approve(ADDR_SOLID_FOUNDRY, billDai)

    commit('approve_accout', approvalDai)
  },
  async mintOnBuy ({ state }, inputAmout) {
    const amt = ethers.utils.parseUnits(inputAmout, 18);
    const solidFoudryWithSigner = state.contracts.solidFoundry.connect(signer);

    let mintSolidDAI = await solidFoudryWithSigner.mintOnBuy(
      ADDR_DAI_ERC20,
      state.account,
      amt,
      '0'
    );
    console.log(mintSolidDAI);
  },
  async burnOnSell ({ state }, inputAmout) {
    const amt = ethers.utils.parseUnits(inputAmout, 18);
    const solidFoudryWithSigner = state.contracts.solidFoundry.connect(signer);

    let buySolidDAI = await solidFoudryWithSigner.burnOnSell(
      ADDR_DAI_ERC20,
      state.account,
      amt,
      '0'
    );
    console.log(buySolidDAI);
  },
  async claimReward ({ state }) {
    const solidFoudryWithSigner = state.contracts.solidFoundry.connect(signer);
    let ClaimReward = await solidFoudryWithSigner.claimReward(ADDR_DAI_ERC20, state.account);

    console.log('claim', ClaimReward)
  },
  disconnect ({ state }) {
    state.account = null
  },
}

const mutations = {
  init (state) {
    state.contracts.solidFoundry = new ethers.Contract(ADDR_SOLID_FOUNDRY, abiSolidFoundry, provider);
    state.contracts.daiErc20 = new ethers.Contract(ADDR_DAI_ERC20, abiDaiErc20, provider)
    state.contracts.ethErc20 = new ethers.Contract(ADDR_ETH_ERC20, abiEthErc20, provider)
    // state.contracts.wrapEthErc20 = new window.web3.eth.Contract(abiWrapEthErc20, ADDR_WRAPETH_ERC20);
    // state.contracts.maticEscrow = new window.web3.eth.Contract(abiMaticEscrow, ADDR_MATIC_ESCROW);
    // state.contracts.solidEscrow = new window.web3.eth.Contract(abiSolidEscrow, ADDR_SOLID_ESCROW);
    // state.contracts.maticErc20 = new window.web3.eth.Contract(abiMaticErc20, ADDR_MATIC_ERC20);
  },
  set_account (state, account) {
    state.account = account
    // window.ethereum.request({
    //   method: 'wallet_watchAsset',
    //   params: {
    //     type: 'ERC20',
    //     options: {
    //       address: ADDR_SOLID_FOUNDRY,
    //       symbol: 'SLD',
    //       decimals: 18,
    //       //image: tokenImage,
    //     },
    //   },
    // });
  },
  set_balance (state, balance) {
    state.ethBalance = balance;
  },
  approve_accout (state, amt) {
    state.approve = amt;
  },
  async read_contract (state, address) {
    // total supply 
    let supply = await state.contracts.solidFoundry.totalSupply()
    supply = supply / 10 ** 18;
    state.foundryTotalSupply = supply;

    // dai balance
    let daiBalance = await state.contracts.daiErc20.balanceOf(address);
    daiBalance = divideBy18(daiBalance);
    state.daiBalance = daiBalance;

    // SOLID DAI BALANCE
    let solidDaiBalance = await state.contracts.solidFoundry.balanceOf(address);
    solidDaiBalance = divideBy18(solidDaiBalance)
    state.solidDaiBalance = solidDaiBalance;

    let allowanceValue = await state.contracts.daiErc20.allowance(
      address,
      ADDR_SOLID_FOUNDRY
    );
    state.approve = allowanceValue / 10 ** 18;

  },
  unapprove (state) {
    state.approve = null
  },
}

export default {
  state,
  getters,
  actions,
  mutations
}