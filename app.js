// Nodos RPC de la red Hive
const HIVE_NODES = [
  'https://api.hive.blog',
  'https://api.hivekings.com',
  'https://anyx.io',
  'https://techcoderx.com',
  'https://rpc.ausbit.dev',
  'https://api.openhive.network'
];

let currentNodeIndex = 0;
let globalVestingShares = 0;
let globalVestingFundHive = 0;
let globalRewardPool = null;
let currentHivePrice = 0;
let currentHbdInterestRate = 0;
let currentLang = 'en';
let currentHistoryFilter = 'all';

// Instancias de gráficos para destruirlos antes de re-renderizar
let hpChartInstance = null;
let balanceChartInstance = null;

// Función de traducción auxiliar
function getTranslation(key) {
  return (translations[currentLang] && translations[currentLang][key]) 
    ? translations[currentLang][key] 
    : key;
}

// Escapa texto para insertarlo de forma segura en innerHTML (evita XSS)
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Función para consultar la blockchain con reconexión automática de nodos
async function fetchHiveNodes(method, params = []) {
  for (let attempt = 0; attempt < HIVE_NODES.length; attempt++) {
    const node = HIVE_NODES[currentNodeIndex];
    try {
      const response = await fetch(node, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: method,
          params: params,
          id: 1
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      return data.result;
    } catch (error) {
      console.warn(`Error al conectar con nodo ${node}:`, error.message);
      currentNodeIndex = (currentNodeIndex + 1) % HIVE_NODES.length;
    }
  }
  throw new Error('Todos los nodos RPC fallaron al responder.');
}

// Diccionario de traducciones
const translations = {
  es: {
    subtitle: "Hive, en tiempo real",
    searchBtn: "Analizar",
    globalTitle: "Red Global Hive",
    userTitle: "Análisis de Cuenta",
    lastBlock: "Último Bloque",
    currentWitness: "Witness Actual",
    hivePrice: "Precio HIVE (Feed)",
    hiveStaked: "HIVE en Staking (HP)",
    stakeRatio: "Ratio de Staking",
    hiveSupply: "Suministro HIVE",
    hbdSupply: "Suministro HBD",
    hbdInterest: "Interés HBD (APR)",
    daoBudget: "Fondo DAO (Budget)",
    blockReward: "Recompensa / Bloque",
    sectionNetwork: "Estado de la Red",
    sectionEconomy: "Economía",
    sectionStaking: "Staking",
    sectionRewards: "Recompensas y DAO",
    rewardPool: "Fondo de Recompensas",
    hbdPrintRate: "HBD Print Rate",
    virtualSupply: "Suministro Virtual",
    loading: "Cargando datos...",
    notFound: "Usuario no encontrado en la blockchain.",
    createdOn: "Registrado el",
    mana: "Voting Mana",
    voteValue: "Valor Voto (100%)",
    effHP: "Effective Hive Power",
    ownHP: "Propio",
    delegations: "Delegaciones HP",
    outgoing: "Enviado",
    balanceHive: "Balance HIVE",
    balanceHbd: "Balance HBD",
    savings: "En ahorros",
    posts: "Publicaciones",
    governance: "Gobernanza / Votos",
    witnessesVoted: "Witnesses apoyados",
    pendingRewards: "Recompensas Pendientes",
    noBio: "Sin biografía disponible.",
    recentHistory: "Actividad Reciente",
    noHistory: "No hay movimientos recientes registrados.",
    noFilteredHistory: "No hay movimientos de este tipo.",
    filterAll: "Todo",
    filterTransfers: "Transferencias",
    filterPosts: "Publicaciones",
    filterVotes: "Votos",
    filterRewards: "Recompensas",
    filterOther: "Otros",
    hpDistribution: "Distribución de HP",
    balanceBreakdown: "Desglose de Balances ($USD)",
    chartHpOwn: "Propio",
    chartHpReceived: "Recibido",
    chartHpDelegated: "Delegado Out",
    opTransfer: "Transferencia de",
    opTo: "a",
    opVote: "Voto",
    opPost: "en el post de",
    opComment: "Comentario en respuesta a",
    opNewPost: "Publicación de nuevo post",
    opClaim: "Recompensas reclamadas",
    opCustom: "Acción personalizada (Protocolo:",
    opDelegate: "Delegación de HP a",
    opGeneric: "Operación:",
    voteEstimateSub: "Estimación con 100% de Mana y Peso",
    voteCurrentMana: "Con tu mana actual",
    voteFullMana: "Al 100% de mana",
    userPrompt: "Ingresa un usuario en el buscador para analizar su cuenta",
    footerText: 'Hecho con ❤️ por <a href="https://peakd.com/@rzazo24" target="_blank" rel="noopener">@rzazo24</a>',
    opCurationReward: "Recompensa de curación",
    opForPost: "en post de",
    opEffectiveVote: "Voto procesado en post de",
    opAuthorReward: "Recompensa de autor",
    postCount: "Publicaciones Totales",
    lastPost: "Última Publicación",
    resourceCredits: "Resource Credits (RC)",
    never: "Sin publicaciones",
    accountAge: "Antigüedad de la Cuenta",
    daysAgo: "días",
    lastComment: "Último Comentario",
    noRecentComment: "Sin comentarios recientes",
    powerDown: "Power Down",
    powerDownActive: "Activo",
    powerDownInactive: "Inactivo",
    perWeek: "por semana",
    nextPayout: "Próximo pago",
    followers: "Seguidores / Siguiendo",
    portfolioValue: "Valor Total del Portfolio",
    lastVote: "Último Voto Emitido",
    hbdInterestEstimate: "Interés Anual Estimado (HBD Savings)",
    neverVoted: "Sin votos registrados",
    sectionVotingPower: "Poder de Voto y Staking",
    sectionBalances: "Balances y Patrimonio",
    sectionActivity: "Actividad",
    sectionGovernanceRes: "Gobernanza y Recursos"
  },
  en: {
    subtitle: "Hive, in real-time",
    searchBtn: "Analyze",
    globalTitle: "Global Hive Network",
    userTitle: "Account Analysis",
    lastBlock: "Last Block",
    currentWitness: "Current Witness",
    hivePrice: "HIVE Price (Feed)",
    hiveStaked: "Staked HIVE (HP)",
    stakeRatio: "Staking Ratio",
    hiveSupply: "HIVE Supply",
    hbdSupply: "HBD Supply",
    hbdInterest: "HBD Interest (APR)",
    daoBudget: "DAO Fund (Budget)",
    blockReward: "Block Reward",
    sectionNetwork: "Network Status",
    sectionEconomy: "Economy",
    sectionStaking: "Staking",
    sectionRewards: "Rewards & DAO",
    rewardPool: "Reward Pool",
    hbdPrintRate: "HBD Print Rate",
    virtualSupply: "Virtual Supply",
    loading: "Loading data...",
    notFound: "User not found on the blockchain.",
    createdOn: "Joined on",
    mana: "Voting Mana",
    voteValue: "Vote Value (100%)",
    effHP: "Effective Hive Power",
    ownHP: "Own",
    delegations: "HP Delegations",
    outgoing: "Outgoing",
    balanceHive: "HIVE Balance",
    balanceHbd: "HBD Balance",
    savings: "In savings",
    posts: "Posts",
    governance: "Governance / Votes",
    witnessesVoted: "Witnesses supported",
    pendingRewards: "Pending Rewards",
    noBio: "No bio available.",
    recentHistory: "Recent Activity",
    noHistory: "No recent activity found.",
    noFilteredHistory: "No activity of this type found.",
    filterAll: "All",
    filterTransfers: "Transfers",
    filterPosts: "Posts",
    filterVotes: "Votes",
    filterRewards: "Rewards",
    filterOther: "Other",
    hpDistribution: "HP Distribution",
    balanceBreakdown: "Balance Breakdown ($USD)",
    chartHpOwn: "Own",
    chartHpReceived: "Received",
    chartHpDelegated: "Delegated Out",
    opTransfer: "Transfer of",
    opTo: "to",
    opVote: "Vote",
    opPost: "on post by",
    opComment: "Comment reply to",
    opNewPost: "New post published",
    opClaim: "Claimed rewards",
    opCustom: "Custom action (Protocol:",
    opDelegate: "HP Delegation to",
    opGeneric: "Operation:",
    voteEstimateSub: "Estimation with 100% Mana and Weight",
    voteCurrentMana: "With your current mana",
    voteFullMana: "At 100% mana",
    userPrompt: "Enter a username in the search bar to analyze their account",
    footerText: 'Made with ❤️ by <a href="https://peakd.com/@rzazo24" target="_blank" rel="noopener">@rzazo24</a>',
    opCurationReward: "Curation reward",
    opForPost: "on post by",
    opEffectiveVote: "Effective vote on post by",
    opAuthorReward: "Author reward",
    postCount: "Total Posts",
    lastPost: "Last Post",
    resourceCredits: "Resource Credits (RC)",
    never: "No posts yet",
    accountAge: "Account Age",
    daysAgo: "days",
    lastComment: "Last Comment",
    noRecentComment: "No recent comments",
    powerDown: "Power Down",
    powerDownActive: "Active",
    powerDownInactive: "Inactive",
    perWeek: "per week",
    nextPayout: "Next payout",
    followers: "Followers / Following",
    portfolioValue: "Total Portfolio Value",
    lastVote: "Last Vote Cast",
    hbdInterestEstimate: "Estimated Annual Interest (HBD Savings)",
    neverVoted: "No votes recorded",
    sectionVotingPower: "Voting Power & Staking",
    sectionBalances: "Balances & Net Worth",
    sectionActivity: "Activity",
    sectionGovernanceRes: "Governance & Resources"
  }
};

// Formatea números forzando coma para miles y punto para decimales,
// sin importar el idioma/región configurado en el navegador del usuario
function formatNumber(num, options = {}) {
  const n = parseFloat(num);
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-US', options);
}

// Conversión segura de VESTS a HP
function vestsToHP(vests) {
  const v = parseFloat(vests || 0);
  if (!globalVestingShares || !globalVestingFundHive || isNaN(v) || v === 0) {
    return 0;
  }
  return (v * globalVestingFundHive) / globalVestingShares;
}

// Cálculo de reputación universal
function calculateReputation(rep) {
  if (rep === undefined || rep === null) return 25;
  const numRep = Number(rep);
  if (!isNaN(numRep) && numRep > 0 && numRep < 100) return Math.floor(numRep);
  if (rep == 0 || rep === "0") return 25;

  let isNegative = false;
  let repStr = rep.toString().trim();
  if (repStr.startsWith('-')) {
    isNegative = true;
    repStr = repStr.substring(1);
  }

  if (repStr.length < 10) return 25;
  const leadDigits = parseInt(repStr.substring(0, 9), 10);
  const log10 = (repStr.length - 9) + Math.log10(leadDigits / 1e8);

  let out = log10;
  if (isNaN(out) || out < 0) out = 0;

  out = (isNegative ? -1 : 1) * out;
  out = out * 9 + 25;
  return Math.floor(out);
}

// Calcular el porcentaje de Resource Credits (RC) regenerados hasta ahora
function calculateRCPercent(rcAccount) {
  if (!rcAccount || !rcAccount.rc_manabar || !rcAccount.max_rc) return null;

  const maxRC = parseFloat(rcAccount.max_rc || 0);
  if (maxRC <= 0) return null;

  const currentMana = parseFloat(rcAccount.rc_manabar.current_mana || 0);
  const lastUpdateTime = parseInt(rcAccount.rc_manabar.last_update_time || 0);
  const now = Math.floor(Date.now() / 1000);
  const elapsed = Math.max(0, now - lastUpdateTime);

  let regenerated = currentMana + (elapsed * maxRC) / 432000; // Regeneración total en ~5 días
  if (regenerated > maxRC) regenerated = maxRC;

  return ((regenerated / maxRC) * 100).toFixed(2);
}

// Calcular valor estimado de un voto, en HIVE y su equivalente en USD.
// votingPowerBasis va de 0 a 10000 (10000 = 100% de mana). Por defecto, 100%.
function calculateVoteValue(userEffVests, votingPowerBasis = 10000) {
  if (!globalRewardPool || userEffVests <= 0) return { hive: 0, usd: 0 };

  const rawRewardBalance = globalRewardPool.reward_balance || globalRewardPool.balance || "0 HIVE";
  const rewardBalance = parseFloat(rawRewardBalance.split(' ')[0]);
  const recentClaims = parseFloat(globalRewardPool.recent_claims || 0);

  if (!rewardBalance || !recentClaims) return { hive: 0, usd: 0 };

  // Los VESTS de la API tienen 6 decimales; para casar con la escala interna
  // de "recent_claims" hay que convertirlos a su unidad entera (x 1,000,000).
  const vestsInBase = userEffVests * 1e6;
  const power = (votingPowerBasis * 10000 / 10000) / 50 + 1;
  const rshares = (power * vestsInBase) / 10000;

  const voteValueHive = (rshares / recentClaims) * rewardBalance;
  return { hive: voteValueHive, usd: voteValueHive * currentHivePrice };
}

// Agrupa una operación en una categoría de filtro
function getOperationCategory(op) {
  const [type, data] = op;
  switch (type) {
    case 'transfer':
      return 'transfers';
    case 'vote':
      return 'votes';
    case 'comment':
      // Solo los posts nuevos cuentan como "posts"; las respuestas van a "other",
      // igual que parseOperation() las distingue visualmente (📝 vs 💬).
      return data.parent_author ? 'other' : 'posts';
    case 'claim_reward_balance':
    case 'curation_reward':
    case 'author_reward':
      return 'rewards';
    default:
      // effective_comment_vote es una virtual op que duplica el 'vote' ya emitido
      // por el usuario, así que no se agrupa con "votes" para evitar verlo dos veces.
      return 'other';
  }
}

// Formatear operaciones de la blockchain con traducción dinámica
function parseOperation(op) {
  const [type, data] = op;
  const t = (key) => getTranslation(key);

  switch (type) {
    case 'transfer':
      return `💸 ${t('opTransfer')} <strong>${escapeHtml(data.amount)}</strong> ${t('opTo')} <strong>@${escapeHtml(data.to)}</strong> ${data.memo ? `<i>("${escapeHtml(data.memo)}")</i>` : ''}`;
    
    case 'vote':
      return `👍 ${t('opVote')} (${data.weight / 100}%) ${t('opPost')} <strong>@${escapeHtml(data.author)}</strong>`;
    
    case 'effective_comment_vote':
      return `⚡ ${t('opEffectiveVote') || 'Voto procesado en post de'} <strong>@${escapeHtml(data.author)}</strong>`;

    case 'comment':
      return data.parent_author ? `💬 ${t('opComment')} <strong>@${escapeHtml(data.parent_author)}</strong>` : `📝 ${t('opNewPost')}`;
    
    case 'claim_reward_balance': {
      const hive = parseFloat(data.reward_hive) || 0;
      const hbd = parseFloat(data.reward_hbd) || 0;
      const vests = parseFloat(data.reward_vests) || 0;

      const hp = (typeof vestsToHP === 'function')
        ? vestsToHP(vests)
        : (vests * (window.globalVestingFund / window.globalVestingShares) || (vests * 0.000577));

      return `🎁 ${t('opClaim')}: <strong>${hive.toFixed(3)} HIVE</strong>, <strong>${hp.toFixed(3)} HP</strong>, <strong>${hbd.toFixed(3)} HBD</strong>`;
    }

    case 'curation_reward': {
      const vests = parseFloat(data.reward) || 0;
      const hp = (typeof vestsToHP === 'function')
        ? vestsToHP(vests)
        : (vests * (window.globalVestingFund / window.globalVestingShares) || (vests * 0.000577));

      const authorName = data.author || 'autor';
      return `🏆 ${t('opCurationReward')}: <strong>${hp.toFixed(3)} HP</strong> ${t('opForPost')} <strong>@${escapeHtml(authorName)}</strong>`;
    }

    case 'author_reward': {
      const hbd = parseFloat(data.hbd_payout) || 0;
      const hive = parseFloat(data.hive_payout) || 0;
      const vests = parseFloat(data.vesting_payout) || 0;

      const hp = (typeof vestsToHP === 'function')
        ? vestsToHP(vests)
        : (vests * (window.globalVestingFund / window.globalVestingShares) || (vests * 0.000577));

      return `✍️ ${t('opAuthorReward') || 'Recompensa de autor'}: <strong>${hp.toFixed(3)} HP</strong>, <strong>${hbd.toFixed(3)} HBD</strong>, <strong>${hive.toFixed(3)} HIVE</strong>`;
    }

    case 'custom_json':
      return `⚡ ${t('opCustom')} (${escapeHtml(data.id)})`;

    case 'delegate_vesting_shares':
      return `🔄 ${t('opDelegate')} <strong>@${escapeHtml(data.delegatee)}</strong>`;

    default:
      return `⚙️ ${t('opGeneric')} <code>${escapeHtml(type)}</code>`;
  }
}

// Cargar métricas globales de la red Hive
async function loadGlobalStats() {
  try {
    const props = await fetchHiveNodes('condenser_api.get_dynamic_global_properties');
    globalRewardPool = await fetchHiveNodes('condenser_api.get_reward_fund', ['post']);

    globalVestingShares = parseFloat(props.total_vesting_shares || 0);
    globalVestingFundHive = parseFloat(props.total_vesting_fund_hive || 0);

    const priceData = await fetchHiveNodes('condenser_api.get_current_median_history_price');
    const base = parseFloat(priceData.base || 0);
    const quote = parseFloat(priceData.quote || 1);
    currentHivePrice = base / quote;

    document.getElementById('global-block').innerText = props.head_block_number ? formatNumber(props.head_block_number) : '---';
    document.getElementById('global-witness').innerText = props.current_witness ? `@${props.current_witness}` : '---';
    document.getElementById('global-hive-price').innerText = `$${currentHivePrice.toFixed(3)} USD`;

    const totalHiveStaked = vestsToHP(globalVestingShares);
    const currentSupply = parseFloat(props.current_supply || 0);
    const stakeRatio = currentSupply > 0 ? ((totalHiveStaked / currentSupply) * 100).toFixed(2) : '0.00';

    document.getElementById('global-hive-staked').innerText = `${formatNumber(Math.round(totalHiveStaked))} HP`;
    document.getElementById('global-stake-ratio').innerText = `${stakeRatio}%`;
    document.getElementById('global-hive-supply').innerText = `${formatNumber(Math.round(currentSupply))} HIVE`;
    document.getElementById('global-hbd-supply').innerText = `${formatNumber(Math.round(parseFloat(props.current_hbd_supply || 0)))} HBD`;

    const rawInterest = props.hbd_interest_rate !== undefined ? props.hbd_interest_rate : 0;
    const hbdInterestRate = (parseFloat(rawInterest) / 100).toFixed(1);
    currentHbdInterestRate = isNaN(hbdInterestRate) ? 0 : parseFloat(hbdInterestRate);
    document.getElementById('global-hbd-interest').innerText = isNaN(hbdInterestRate) ? '0.0%' : `${hbdInterestRate}%`;

    let daoBalanceStr = "0 HBD";
    try {
      const daoAccounts = await fetchHiveNodes('condenser_api.get_accounts', [['hive.fund']]);
      if (daoAccounts && daoAccounts.length > 0) {
        const rawHbd = daoAccounts[0].hbd_balance || "0 HBD";
        const daoHbd = parseFloat(rawHbd.split(' ')[0]);
        if (!isNaN(daoHbd)) daoBalanceStr = `${formatNumber(Math.round(daoHbd))} HBD`;
      }
    } catch (e) {
      console.warn("No se pudo obtener el saldo del fondo DAO:", e);
    }
    
    document.getElementById('global-dao-budget').innerText = daoBalanceStr;
    document.getElementById('global-block-reward').innerText = '1.25 HIVE';

    // Fondo de recompensas total (HIVE + equivalente USD)
    if (globalRewardPool && globalRewardPool.reward_balance) {
      const rewardPoolHive = parseFloat(globalRewardPool.reward_balance.split(' ')[0]) || 0;
      const rewardPoolUSD = rewardPoolHive * currentHivePrice;
      document.getElementById('global-reward-pool').innerText = `${formatNumber(Math.round(rewardPoolHive))} HIVE ($${formatNumber(rewardPoolUSD, {maximumFractionDigits: 0})})`;
    }

    // HBD Print Rate (props.hbd_print_rate va de 0 a 10000, siendo 10000 = 100%)
    const rawPrintRate = props.hbd_print_rate !== undefined ? props.hbd_print_rate : 10000;
    const printRatePercent = (parseFloat(rawPrintRate) / 100).toFixed(1);
    document.getElementById('global-hbd-print-rate').innerText = isNaN(printRatePercent) ? '--' : `${printRatePercent}%`;

    // Suministro Virtual (HIVE líquido + HIVE equivalente en staking)
    if (props.virtual_supply) {
      const virtualSupplyNum = parseFloat(props.virtual_supply.split(' ')[0]) || 0;
      document.getElementById('global-virtual-supply').innerText = `${formatNumber(Math.round(virtualSupplyNum))} HIVE`;
    }

  } catch (error) {
    console.error('Error cargando estadísticas globales:', error);
  }
}

// Cargar y consultar datos de la cuenta de usuario
async function loadUserData() {
  const usernameInput = document.getElementById('username').value.trim().toLowerCase();
  const container = document.getElementById('user-section');
  const t = translations[currentLang];

  if (!usernameInput) return;
  container.innerHTML = `<div class="loader">${t.loading}</div>`;

  if (!globalRewardPool || !currentHivePrice) {
    await loadGlobalStats();
  }

  try {
    const accounts = await fetchHiveNodes('condenser_api.get_accounts', [[usernameInput]]);

    if (!accounts || accounts.length === 0) {
      container.innerHTML = `<div class="card" style="text-align:center; color:var(--primary);">${t.notFound}</div>`;
      return;
    }

    const user = accounts[0];
    let profileData = null;
    let historyData = [];
    let rcAccount = null;
    let followCounts = null;

    try {
      profileData = await fetchHiveNodes('bridge.get_profile', { account: usernameInput });
      historyData = await fetchHiveNodes('condenser_api.get_account_history', [usernameInput, -1, 100]);
    } catch (e) {
      console.warn("No se pudieron obtener datos secundarios del usuario:", e);
    }

    try {
      const rcResult = await fetchHiveNodes('rc_api.find_rc_accounts', { accounts: [usernameInput] });
      if (rcResult && rcResult.rc_accounts && rcResult.rc_accounts.length > 0) {
        rcAccount = rcResult.rc_accounts[0];
      }
    } catch (e) {
      console.warn("No se pudo obtener el RC del usuario:", e);
    }

    try {
      followCounts = await fetchHiveNodes('condenser_api.get_follow_count', [usernameInput]);
    } catch (e) {
      console.warn("No se pudo obtener el conteo de seguidores:", e);
    }

    renderUserUI(user, profileData, historyData, rcAccount, followCounts);

  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    container.innerHTML = `<div class="card" style="text-align:center; color:var(--primary);">Error de conexión con los nodos RPC de Hive.</div>`;
  }
}

// Busca el comentario más reciente dentro del historial de actividad ya cargado
function findLastComment(historyData) {
  if (!historyData || historyData.length === 0) return null;

  // El historial viene ordenado de más antiguo a más reciente, recorremos desde el final
  for (let i = historyData.length - 1; i >= 0; i--) {
    const opData = historyData[i][1];
    const op = opData.op;
    const [type, data] = op;

    if (type === 'comment' && data.parent_author) {
      return {
        timestamp: opData.timestamp,
        parentAuthor: data.parent_author
      };
    }
  }
  return null;
}

// Renderizar la interfaz
function renderUserUI(user, profileData, historyData = [], rcAccount = null, followCounts = null) {
  const container = document.getElementById('user-section');
  const t = translations[currentLang];

  // VESTS y HP
  const ownVests = parseFloat(user.vesting_shares || 0);
  const recVests = parseFloat(user.received_vesting_shares || 0);
  const delVests = parseFloat(user.delegated_vesting_shares || 0);

  const ownHP = vestsToHP(ownVests);
  const recHP = vestsToHP(recVests);
  const delHP = vestsToHP(delVests);
  const effHP = ownHP + recHP - delHP;

  const effVests = ownVests + recVests - delVests;

  // Voting Mana
  let manaPercent = "100.00";
  if (user.voting_manabar) {
    const maxMana = effVests * 1000000;
    if (maxMana > 0) {
      const currentMana = parseFloat(user.voting_manabar.current_mana || 0);
      const lastUpdateTime = parseInt(user.voting_manabar.last_update_time || 0);
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - lastUpdateTime);

      let regeneratedMana = currentMana + (elapsed * maxMana) / 432000;
      if (regeneratedMana > maxMana) regeneratedMana = maxMana;
      manaPercent = ((regeneratedMana / maxMana) * 100).toFixed(2);
    }
  }

  // Valor del voto: con la mana actual real (comparable con PeakD) y estimado al 100%
  const manaPercentNum = parseFloat(manaPercent);
  const voteValueCurrent = calculateVoteValue(effVests, manaPercentNum * 100);
  const voteValueFull = calculateVoteValue(effVests, 10000);

  // Metadatos y perfil
  let metadata = {};
  if (profileData && profileData.metadata && profileData.metadata.profile) {
    metadata = profileData.metadata.profile;
  } else {
    try {
      const rawMeta = user.posting_json_metadata || user.json_metadata;
      if (rawMeta) metadata = JSON.parse(rawMeta).profile || {};
    } catch (e) {}
  }

  const rawRep = (profileData && profileData.reputation !== undefined) ? profileData.reputation : user.reputation;
  const reputation = calculateReputation(rawRep);

  const avatarUrl = metadata.profile_image || `https://images.hive.blog/u/${user.name}/avatar`;
  const name = metadata.name || user.name;
  const about = metadata.about || t.noBio;
  const location = metadata.location ? `📍 ${escapeHtml(metadata.location)}` : '';
  const website = metadata.website ? `🔗 <a href="${escapeHtml(metadata.website)}" target="_blank" style="color:var(--accent); text-decoration:none;">${escapeHtml(metadata.website)}</a>` : '';
  const createdDate = new Date(user.created + 'Z').toLocaleDateString();

  // Antigüedad de la cuenta en días
  const createdTimestamp = new Date(user.created + 'Z').getTime();
  const accountAgeDays = Math.floor((Date.now() - createdTimestamp) / (1000 * 60 * 60 * 24));

  // Witnesses apoyados (votados)
  const witnessesVotedCount = user.witnesses_voted_for !== undefined ? parseInt(user.witnesses_voted_for) : 0;

  // Recompensas pendientes (HIVE + HBD + HP sin reclamar)
  const pendingHive = parseFloat((user.reward_hive_balance || "0 HIVE").split(' ')[0]);
  const pendingHbd = parseFloat((user.reward_hbd_balance || "0 HBD").split(' ')[0]);
  const pendingVests = parseFloat((user.reward_vesting_balance || "0 VESTS").split(' ')[0]);
  const pendingHP = vestsToHP(pendingVests);
  const hasPendingRewards = (pendingHive > 0 || pendingHbd > 0 || pendingHP > 0);

  // Último comentario (buscado en el historial de actividad reciente)
  const lastComment = findLastComment(historyData);

  // Power Down: retiro semanal de HP programado
  const withdrawRateVests = parseFloat((user.vesting_withdraw_rate || "0 VESTS").split(' ')[0]);
  const isPoweringDown = withdrawRateVests > 0;
  const powerDownWeeklyHP = isPoweringDown ? vestsToHP(withdrawRateVests) : 0;
  const nextWithdrawalRaw = user.next_vesting_withdrawal;
  let nextWithdrawalText = '';
  if (isPoweringDown && nextWithdrawalRaw && !nextWithdrawalRaw.startsWith('1969-12-31')) {
    nextWithdrawalText = new Date(nextWithdrawalRaw + 'Z').toLocaleDateString();
  }

  // Seguidores / Siguiendo
  const followerCount = followCounts && followCounts.follower_count !== undefined ? followCounts.follower_count : null;
  const followingCount = followCounts && followCounts.following_count !== undefined ? followCounts.following_count : null;

  // Valor total del portfolio en USD (HIVE + HP + HBD)
  const hiveBalanceNum = parseFloat(user.balance || 0);
  const hbdBalanceNum = parseFloat(user.hbd_balance || 0);
  const savingsHiveNum = parseFloat(user.savings_balance || 0);
  const savingsHbdNum = parseFloat(user.savings_hbd_balance || 0);
  const portfolioUSD = ((hiveBalanceNum + savingsHiveNum) * currentHivePrice)
    + (ownHP * currentHivePrice)
    + (hbdBalanceNum + savingsHbdNum);

  // Último voto emitido
  const rawLastVote = user.last_vote_time;
  let lastVoteText = t.neverVoted;
  if (rawLastVote && !rawLastVote.startsWith('1970-01-01')) {
    lastVoteText = new Date(rawLastVote + 'Z').toLocaleDateString();
  }

  // Interés anual estimado sobre HBD en ahorros
  const hbdInterestAnnualEstimate = savingsHbdNum * (currentHbdInterestRate / 100);

  // Publicaciones totales
  const postCount = user.post_count !== undefined ? parseInt(user.post_count) : 0;

  // Fecha de última publicación
  const rawLastPost = user.last_root_post || user.last_post;
  let lastPostText = t.never;
  if (rawLastPost && !rawLastPost.startsWith('1970-01-01')) {
    lastPostText = new Date(rawLastPost + 'Z').toLocaleDateString();
  }

  // Resource Credits (RC)
  const rcPercent = calculateRCPercent(rcAccount);

  container.innerHTML = `
    <div class="profile-card">
      <img src="${escapeHtml(avatarUrl)}" class="profile-avatar" alt="${escapeHtml(user.name)}" onerror="this.src='https://images.hive.blog/u/${escapeHtml(user.name)}/avatar'">
      <div class="profile-info">
        <h2>${escapeHtml(name)} <span class="rep-badge">REP ${reputation}</span></h2>
        <p>@${escapeHtml(user.name)} • ${t.createdOn} ${createdDate} ${location ? '• ' + location : ''}</p>
        <p style="margin-top: 6px; color: var(--text);">${escapeHtml(about)}</p>
        ${website ? `<p style="margin-top: 4px;">${website}</p>` : ''}
      </div>
    </div>

    <!-- Poder de Voto y Staking -->
    <h3 class="subsection-title" data-i18n="sectionVotingPower">${t.sectionVotingPower}</h3>
    <div class="grid">
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="label" data-i18n="mana">${t.mana}</span>
          <span style="font-weight:700; color:var(--success);">${manaPercent}%</span>
        </div>
        <div class="progress-bar-container" style="margin-top:10px;">
          <div class="progress-bar" style="width: ${Math.min(100, Math.max(0, parseFloat(manaPercent)))}%;"></div>
        </div>
      </div>
      <div class="card">
        <div class="label" data-i18n="voteValue">${t.voteValue}</div>
        <div class="value" style="color:var(--success);">${formatNumber(voteValueCurrent.hive, {maximumFractionDigits: 3})} HIVE</div>
        <div class="subvalue">≈ $${formatNumber(voteValueCurrent.usd, {maximumFractionDigits: 3})} USD • ${t.voteCurrentMana}</div>
        <div class="subvalue" style="margin-top:2px; color:var(--text-muted);">${t.voteFullMana}: ${formatNumber(voteValueFull.hive, {maximumFractionDigits: 3})} HIVE</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="effHP">${t.effHP}</div>
        <div class="value">${formatNumber(effHP, {maximumFractionDigits: 2})} HP</div>
        <div class="subvalue"><span data-i18n="ownHP">${t.ownHP}</span>: ${formatNumber(ownHP, {maximumFractionDigits: 0})} HP</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="delegations">${t.delegations}</div>
        <div class="value" style="color:var(--accent);">+${formatNumber(recHP, {maximumFractionDigits: 0})} HP</div>
        <div class="subvalue" style="color:var(--primary);"><span data-i18n="outgoing">${t.outgoing}</span>: -${formatNumber(delHP, {maximumFractionDigits: 0})} HP</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="powerDown">${t.powerDown}</div>
        <div class="value" style="color:${isPoweringDown ? 'var(--primary)' : 'var(--text-muted)'};">
          ${isPoweringDown ? t.powerDownActive : t.powerDownInactive}
        </div>
        ${isPoweringDown ? `<div class="subvalue">-${formatNumber(powerDownWeeklyHP, {maximumFractionDigits: 3})} HP / ${t.perWeek}${nextWithdrawalText ? ` • ${t.nextPayout}: ${nextWithdrawalText}` : ''}</div>` : ''}
      </div>
    </div>

    <!-- Balances y Patrimonio -->
    <h3 class="subsection-title" data-i18n="sectionBalances">${t.sectionBalances}</h3>
    <div class="grid">
      <div class="card">
        <div class="label" data-i18n="balanceHive">${t.balanceHive}</div>
        <div class="value">${formatNumber(user.balance)} HIVE</div>
        <div class="subvalue"><span data-i18n="savings">${t.savings}</span>: ${formatNumber(user.savings_balance)} HIVE</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="balanceHbd">${t.balanceHbd}</div>
        <div class="value">${formatNumber(user.hbd_balance)} HBD</div>
        <div class="subvalue"><span data-i18n="savings">${t.savings}</span>: ${formatNumber(user.savings_hbd_balance)} HBD</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="portfolioValue">${t.portfolioValue}</div>
        <div class="value" style="color:var(--success);">$${formatNumber(portfolioUSD, {maximumFractionDigits: 2})} USD</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="hbdInterestEstimate">${t.hbdInterestEstimate}</div>
        <div class="value" style="color:var(--success);">+${formatNumber(hbdInterestAnnualEstimate, {maximumFractionDigits: 3})} HBD</div>
        <div class="subvalue">${currentHbdInterestRate}% APR</div>
      </div>
    </div>

    <!-- Actividad -->
    <h3 class="subsection-title" data-i18n="sectionActivity">${t.sectionActivity}</h3>
    <div class="grid">
      <div class="card">
        <div class="label" data-i18n="postCount">${t.postCount}</div>
        <div class="value">${formatNumber(postCount)}</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="lastPost">${t.lastPost}</div>
        <div class="value">${escapeHtml(lastPostText)}</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="lastComment">${t.lastComment}</div>
        <div class="value">${lastComment ? new Date(lastComment.timestamp + 'Z').toLocaleDateString() : escapeHtml(t.noRecentComment)}</div>
        ${lastComment ? `<div class="subvalue">${t.opComment} <strong>@${escapeHtml(lastComment.parentAuthor)}</strong></div>` : ''}
      </div>
      <div class="card">
        <div class="label" data-i18n="lastVote">${t.lastVote}</div>
        <div class="value">${escapeHtml(lastVoteText)}</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="accountAge">${t.accountAge}</div>
        <div class="value">${formatNumber(accountAgeDays)} <span style="font-size:0.9rem; color:var(--text-muted);" data-i18n="daysAgo">${t.daysAgo}</span></div>
      </div>
    </div>

    <!-- Gobernanza y Recursos -->
    <h3 class="subsection-title" data-i18n="sectionGovernanceRes">${t.sectionGovernanceRes}</h3>
    <div class="grid">
      <div class="card">
        <div class="label" data-i18n="witnessesVoted">${t.witnessesVoted}</div>
        <div class="value">${witnessesVotedCount} / 30</div>
      </div>
      <div class="card">
        <div class="label" data-i18n="pendingRewards">${t.pendingRewards}</div>
        <div class="value" style="color:${hasPendingRewards ? 'var(--success)' : 'var(--text-muted)'};">
          ${hasPendingRewards ? `${formatNumber(pendingHP, {maximumFractionDigits: 3})} HP` : '--'}
        </div>
        ${hasPendingRewards ? `<div class="subvalue">${formatNumber(pendingHive, {maximumFractionDigits: 3})} HIVE • ${formatNumber(pendingHbd, {maximumFractionDigits: 3})} HBD</div>` : ''}
      </div>
      <div class="card">
        <div class="label" data-i18n="resourceCredits">${t.resourceCredits}</div>
        <div class="value" style="color:${rcPercent !== null ? 'var(--success)' : 'var(--text-muted)'};">${rcPercent !== null ? rcPercent + '%' : '--'}</div>
        ${rcPercent !== null ? `<div class="progress-bar-container" style="margin-top:10px;"><div class="progress-bar" style="width: ${Math.min(100, Math.max(0, parseFloat(rcPercent)))}%;"></div></div>` : ''}
      </div>
      <div class="card">
        <div class="label" data-i18n="followers">${t.followers}</div>
        <div class="value">${followerCount !== null ? formatNumber(followerCount) : '--'} / ${followingCount !== null ? formatNumber(followingCount) : '--'}</div>
      </div>
    </div>

    <!-- Sección de Gráficos -->
    <div class="grid" style="margin-top: 20px;">
      <div class="card">
        <h4 style="margin-bottom: 10px; color: var(--accent);" data-i18n="hpDistribution">${t.hpDistribution}</h4>
        <div style="position: relative; height: 220px;">
          <canvas id="hpChart"></canvas>
        </div>
      </div>
      <div class="card">
        <h4 style="margin-bottom: 10px; color: var(--accent);" data-i18n="balanceBreakdown">${t.balanceBreakdown}</h4>
        <div style="position: relative; height: 220px;">
          <canvas id="balanceChart"></canvas>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top: 20px;">
      <h3 style="margin-bottom: 12px; font-size: 1.1em; color: var(--accent);" data-i18n="recentHistory">${t.recentHistory}</h3>
      ${renderHistorySection(historyData)}
    </div>
  `;

  // Inicializar Gráficos después de inyectar el HTML
  renderCharts(ownHP, recHP, delHP, parseFloat(user.balance), parseFloat(user.hbd_balance), effHP);
  setupHistoryFilters(historyData);
}

// Construye el HTML de la lista de actividad, opcionalmente filtrada por categoría
function buildHistoryHTML(historyData, filterKey = 'all') {
  if (!historyData || historyData.length === 0) {
    return `<p style="color: var(--text-dim);">${getTranslation('noHistory')}</p>`;
  }

  const filtered = filterKey === 'all'
    ? historyData
    : historyData.filter(item => getOperationCategory(item[1].op) === filterKey);

  if (filtered.length === 0) {
    return `<p style="color: var(--text-dim);">${getTranslation('noFilteredHistory')}</p>`;
  }

  return filtered.slice().reverse().map(item => {
    const index = item[0];       // Número de secuencia en la cuenta
    const opData = item[1];      // Contenido del evento
    const op = opData.op;
    const trxId = opData.trx_id; // ID único de la transacción
    const timestamp = new Date(opData.timestamp + 'Z').toLocaleString();

    // Muestra hash enlazado a hive block explorer o el número de secuencia (#)
    const shortTrx = (trxId && trxId !== '0000000000000000000000000000000000000000')
      ? `<a href="https://hiveblockexplorer.com/tx/${trxId}" target="_blank" rel="noopener" class="trx-link">#${trxId.substring(0, 8)}</a>`
      : `<span class="trx-num">#${index}</span>`;

    return `
      <div style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9em;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 4px;">
          <div>${parseOperation(op)}</div>
          <div style="font-family: monospace; font-size: 0.8em; flex-shrink: 0;">${shortTrx}</div>
        </div>
        <div style="color: var(--text-dim); font-size: 0.8em;">${timestamp}</div>
      </div>
    `;
  }).join('');
}

// Construye la barra de filtros y el contenedor de la lista de actividad
function renderHistorySection(historyData) {
  const filters = [
    { key: 'all', i18n: 'filterAll' },
    { key: 'transfers', i18n: 'filterTransfers' },
    { key: 'posts', i18n: 'filterPosts' },
    { key: 'votes', i18n: 'filterVotes' },
    { key: 'rewards', i18n: 'filterRewards' },
    { key: 'other', i18n: 'filterOther' }
  ];

  const filterButtonsHTML = filters.map(f => `
    <button class="history-filter-btn${f.key === currentHistoryFilter ? ' active' : ''}" data-filter="${f.key}" data-i18n="${f.i18n}">${getTranslation(f.i18n)}</button>
  `).join('');

  return `
    <div class="history-filters">${filterButtonsHTML}</div>
    <div id="history-list">${buildHistoryHTML(historyData, currentHistoryFilter)}</div>
  `;
}

// Conecta los botones de filtro con el contenedor de la lista, sin recargar datos
function setupHistoryFilters(historyData) {
  const buttons = document.querySelectorAll('.history-filter-btn');
  const listContainer = document.getElementById('history-list');
  if (!listContainer) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentHistoryFilter = btn.getAttribute('data-filter');
      listContainer.innerHTML = buildHistoryHTML(historyData, currentHistoryFilter);
    });
  });
}

// Generación de Gráficos con Chart.js
function renderCharts(ownHP, recHP, delHP, hiveBalance, hbdBalance, effHP) {
  if (hpChartInstance) hpChartInstance.destroy();
  if (balanceChartInstance) balanceChartInstance.destroy();

  // Obtener traducciones para las etiquetas de los gráficos
  const labelOwn = getTranslation('chartHpOwn');
  const labelRec = getTranslation('chartHpReceived');
  const labelDel = getTranslation('chartHpDelegated');

  const ctxHP = document.getElementById('hpChart').getContext('2d');
  hpChartInstance = new Chart(ctxHP, {
    type: 'doughnut',
    data: {
      labels: [labelOwn, labelRec, labelDel],
      datasets: [{
        data: [ownHP, recHP, delHP],
        backgroundColor: ['#e31337', '#00d1b2', '#ffdd57'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ffffff' } }
      }
    }
  });

  const hiveUSD = hiveBalance * currentHivePrice;
  const hpUSD = effHP * currentHivePrice;
  const hbdUSD = hbdBalance * 1.0;

  const ctxBalance = document.getElementById('balanceChart').getContext('2d');
  balanceChartInstance = new Chart(ctxBalance, {
    type: 'bar',
    data: {
      labels: ['HIVE ($)', 'HP ($)', 'HBD ($)'],
      datasets: [{
        data: [hiveUSD, hpUSD, hbdUSD],
        backgroundColor: ['#e31337', '#3273dc', '#23d160'],
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: '#ffffff' } },
        y: { ticks: { color: '#ffffff' } }
      }
    }
  });
}

// Aplica el diccionario de traducciones actual a toda la interfaz
// (elementos con data-i18n, placeholders, y el botón de idioma)
function applyTranslations() {
  const t = translations[currentLang];
  if (!t) return;

  // Bandera y etiqueta del botón de idioma
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = currentLang.toUpperCase();
  }
  const langFlag = document.getElementById('lang-flag');
  if (langFlag) {
    langFlag.textContent = currentLang === 'es' ? '🇪🇸' : '🇬🇧';
  }

  // Elementos estáticos del HTML con data-i18n
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      elem.innerHTML = t[key];
    }
  });

  // Placeholders de inputs
  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) {
      elem.placeholder = t[key];
    }
  });

  // Atributo lang del documento, por accesibilidad y SEO
  document.documentElement.lang = currentLang;
}

// Conmutación de idioma optimizada
function toggleLanguage() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  applyTranslations();

  // Recargar y volver a renderizar los datos del usuario (incluyendo las actividades traducidas)
  const usernameInput = document.getElementById('username');
  if (usernameInput && usernameInput.value.trim() !== '') {
    loadUserData();
  }
}

// ==========================================
// SUGERENCIAS DE USUARIO (AUTOCOMPLETE)
// ==========================================
let debounceTimer = null;

async function handleUserAutocomplete(event) {
  const query = event.target.value.trim().toLowerCase();
  const datalist = document.getElementById('user-suggestions');

  if (!datalist) return;

  if (query.length < 2) {
    datalist.innerHTML = '';
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    try {
      const suggestions = await fetchHiveNodes('condenser_api.lookup_accounts', [query, 5]);

      datalist.innerHTML = suggestions
        .map(username => `<option value="${escapeHtml(username)}">`)
        .join('');
    } catch (error) {
      console.warn('Error obteniendo sugerencias:', error.message);
    }
  }, 300);
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  // Aplica el idioma por defecto (inglés) antes de cargar cualquier dato,
  // así el texto estático del HTML queda sincronizado con currentLang
  applyTranslations();

  const usernameInput = document.getElementById('username');
  if (usernameInput) {
    usernameInput.addEventListener('input', handleUserAutocomplete);
  }

  await loadGlobalStats();
  await loadUserData();

  document.getElementById('search-btn').addEventListener('click', loadUserData);
  document.getElementById('username').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loadUserData();
  });
  document.getElementById('lang-btn').addEventListener('click', toggleLanguage);
});