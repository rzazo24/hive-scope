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
let currentLang = 'es';

// Instancias de gráficos para destruirlos antes de re-renderizar
let hpChartInstance = null;
let balanceChartInstance = null;

// Función de traducción auxiliar
function getTranslation(key) {
  return (translations[currentLang] && translations[currentLang][key]) 
    ? translations[currentLang][key] 
    : key;
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
    userTitle: "Análisis de Cuenta",
    userPrompt: "Ingresa un usuario en el buscador para analizar su cuenta",
    footerText: 'Hecho con ❤️ por <a href="https://peakd.com/@rzazo24" target="_blank" rel="noopener">@rzazo24</a>'
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
    userTitle: "Account Analysis",
    userPrompt: "Enter a username in the search bar to analyze their account",
    footerText: 'Made with ❤️ by <a href="https://peakd.com/@rzazo24" target="_blank" rel="noopener">@rzazo24</a>'
  }
};

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

// Calcular valor estimado de un voto al 100% en USD
function calculateVoteValue(userEffVests) {
  if (!globalRewardPool || !currentHivePrice || userEffVests <= 0) return 0;

  const rawRewardBalance = globalRewardPool.reward_balance || globalRewardPool.balance || "0 HIVE";
  const rewardBalance = parseFloat(rawRewardBalance.split(' ')[0]);
  const recentClaims = parseFloat(globalRewardPool.recent_claims || 0);

  if (!rewardBalance || !recentClaims) return 0;

  const vestsInBase = userEffVests * 1e6;
  const power = (10000 * 10000 / 10000) / 50; 
  const rshares = (power * vestsInBase) / 10000;

  const voteValueHive = (rshares / recentClaims) * rewardBalance;
  return voteValueHive * currentHivePrice;
}

// Formatear operaciones de la blockchain con traducción dinámica
function parseOperation(op) {
  const [type, data] = op;
  const t = (key) => getTranslation(key);

  switch (type) {
    case 'transfer':
      return `💸 ${t('opTransfer')} <strong>${data.amount}</strong> ${t('opTo')} <strong>@${data.to}</strong> ${data.memo ? `<i>("${data.memo}")</i>` : ''}`;
    case 'vote':
      return `👍 ${t('opVote')} (${data.weight / 100}%) ${t('opPost')} <strong>@${data.author}</strong>`;
    case 'comment':
      return data.parent_author ? `💬 ${t('opComment')} <strong>@${data.parent_author}</strong>` : `📝 ${t('opNewPost')}`;
    case 'claim_reward_balance':
      return `🎁 ${t('opClaim')}: ${data.reward_hbd} | ${data.reward_hive}`;
    case 'custom_json':
      return `⚡ ${t('opCustom')} ${data.id})`;
    case 'delegate_vesting_shares':
      return `🔄 ${t('opDelegate')} <strong>@${data.delegatee}</strong>`;
    default:
      return `⚙️ ${t('opGeneric')} <code>${type}</code>`;
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

    document.getElementById('global-block').innerText = props.head_block_number ? props.head_block_number.toLocaleString() : '---';
    document.getElementById('global-witness').innerText = props.current_witness ? `@${props.current_witness}` : '---';
    document.getElementById('global-hive-price').innerText = `$${currentHivePrice.toFixed(3)} USD`;

    const totalHiveStaked = vestsToHP(globalVestingShares);
    const currentSupply = parseFloat(props.current_supply || 0);
    const stakeRatio = currentSupply > 0 ? ((totalHiveStaked / currentSupply) * 100).toFixed(2) : '0.00';

    document.getElementById('global-hive-staked').innerText = `${Math.round(totalHiveStaked).toLocaleString()} HP`;
    document.getElementById('global-stake-ratio').innerText = `${stakeRatio}%`;
    document.getElementById('global-hive-supply').innerText = `${Math.round(currentSupply).toLocaleString()} HIVE`;
    document.getElementById('global-hbd-supply').innerText = `${Math.round(parseFloat(props.current_hbd_supply || 0)).toLocaleString()} HBD`;

    const rawInterest = props.hbd_interest_rate !== undefined ? props.hbd_interest_rate : 0;
    const hbdInterestRate = (parseFloat(rawInterest) / 100).toFixed(1);
    document.getElementById('global-hbd-interest').innerText = isNaN(hbdInterestRate) ? '0.0%' : `${hbdInterestRate}%`;

    let daoBalanceStr = "0 HBD";
    try {
      const daoAccounts = await fetchHiveNodes('condenser_api.get_accounts', [['hive.fund']]);
      if (daoAccounts && daoAccounts.length > 0) {
        const rawHbd = daoAccounts[0].hbd_balance || "0 HBD";
        const daoHbd = parseFloat(rawHbd.split(' ')[0]);
        if (!isNaN(daoHbd)) daoBalanceStr = `${Math.round(daoHbd).toLocaleString()} HBD`;
      }
    } catch (e) {
      console.warn("No se pudo obtener el saldo del fondo DAO:", e);
    }
    
    document.getElementById('global-dao-budget').innerText = daoBalanceStr;
    document.getElementById('global-block-reward').innerText = '1.25 HIVE';

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

    try {
      profileData = await fetchHiveNodes('bridge.get_profile', { account: usernameInput });
      historyData = await fetchHiveNodes('condenser_api.get_account_history', [usernameInput, -1, 10]);
    } catch (e) {
      console.warn("No se pudieron obtener datos secundarios del usuario:", e);
    }

    renderUserUI(user, profileData, historyData);

  } catch (error) {
    console.error('Error al cargar datos del usuario:', error);
    container.innerHTML = `<div class="card" style="text-align:center; color:var(--primary);">Error de conexión con los nodos RPC de Hive.</div>`;
  }
}

// Renderizar la interfaz
function renderUserUI(user, profileData, historyData = []) {
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

  // Valor de voto al 100% en USD
  const effVests = ownVests + recVests - delVests;
  const voteValueUSD = calculateVoteValue(effVests);

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
  const location = metadata.location ? `📍 ${metadata.location}` : '';
  const website = metadata.website ? `🔗 <a href="${metadata.website}" target="_blank" style="color:var(--accent); text-decoration:none;">${metadata.website}</a>` : '';
  const createdDate = new Date(user.created + 'Z').toLocaleDateString();

  // Historial Reciente
  let historyHTML = '';
  if (historyData && historyData.length > 0) {
    historyHTML = historyData.slice().reverse().map(item => {
      const op = item[1].op;
      const timestamp = new Date(item[1].timestamp + 'Z').toLocaleString();
      return `
        <div style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.9em;">
          <div>${parseOperation(op)}</div>
          <div style="color: var(--text-dim); font-size: 0.8em; margin-top: 2px;">${timestamp}</div>
        </div>
      `;
    }).join('');
  } else {
    historyHTML = `<p style="color: var(--text-dim);">${t.noHistory}</p>`;
  }

  container.innerHTML = `
    <div class="profile-card">
      <img src="${avatarUrl}" class="profile-avatar" alt="${user.name}" onerror="this.src='https://images.hive.blog/u/${user.name}/avatar'">
      <div class="profile-info">
        <h2>${name} <span class="rep-badge">REP ${reputation}</span></h2>
        <p>@${user.name} • ${t.createdOn} ${createdDate} ${location ? '• ' + location : ''}</p>
        <p style="margin-top: 6px; color: var(--text);">${about}</p>
        ${website ? `<p style="margin-top: 4px;">${website}</p>` : ''}
      </div>
    </div>

    <!-- Métrica Mana & Valor del Voto en USD -->
    <div class="grid" style="margin-bottom: 20px;">
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
        <div class="value" style="color:var(--success);">$${voteValueUSD.toFixed(3)} USD</div>
        <div class="subvalue" data-i18n="voteEstimateSub">${t.voteEstimateSub}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="label" data-i18n="effHP">${t.effHP}</div>
        <div class="value">${effHP.toLocaleString(undefined, {maximumFractionDigits: 2})} HP</div>
        <div class="subvalue"><span data-i18n="ownHP">${t.ownHP}</span>: ${ownHP.toLocaleString(undefined, {maximumFractionDigits: 0})} HP</div>
      </div>

      <div class="card">
        <div class="label" data-i18n="delegations">${t.delegations}</div>
        <div class="value" style="color:var(--accent);">+${recHP.toLocaleString(undefined, {maximumFractionDigits: 0})} HP</div>
        <div class="subvalue" style="color:var(--primary);"><span data-i18n="outgoing">${t.outgoing}</span>: -${delHP.toLocaleString(undefined, {maximumFractionDigits: 0})} HP</div>
      </div>

      <div class="card">
        <div class="label" data-i18n="balanceHive">${t.balanceHive}</div>
        <div class="value">${parseFloat(user.balance).toLocaleString()} HIVE</div>
        <div class="subvalue"><span data-i18n="savings">${t.savings}</span>: ${parseFloat(user.savings_balance).toLocaleString()} HIVE</div>
      </div>

      <div class="card">
        <div class="label" data-i18n="balanceHbd">${t.balanceHbd}</div>
        <div class="value">${parseFloat(user.hbd_balance).toLocaleString()} HBD</div>
        <div class="subvalue"><span data-i18n="savings">${t.savings}</span>: ${parseFloat(user.savings_hbd_balance).toLocaleString()} HBD</div>
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
      <div>${historyHTML}</div>
    </div>
  `;

  // Inicializar Gráficos después de inyectar el HTML
  renderCharts(ownHP, recHP, delHP, parseFloat(user.balance), parseFloat(user.hbd_balance), effHP);
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

// Conmutación de idioma optimizada
function toggleLanguage() {
  // 1. Cambiar al nuevo idioma
  currentLang = currentLang === 'es' ? 'en' : 'es';
  
  // 2. Actualizar la etiqueta del botón al idioma activo
  const langLabel = document.getElementById('lang-label');
  if (langLabel) {
    langLabel.textContent = currentLang.toUpperCase();
  }

  // 3. Obtener traducciones
  const t = translations[currentLang];
  if (!t) return;

  // 4. Traducir textos respetando enlaces/HTML
  document.querySelectorAll('[data-i18n]').forEach(elem => {
    const key = elem.getAttribute('data-i18n');
    if (t[key] !== undefined) {
      elem.innerHTML = t[key];
    }
  });

  // 5. Traducir placeholders de inputs
  document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
    const key = elem.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) {
      elem.placeholder = t[key];
    }
  });

  // 6. Re-renderizar perfil si hay un usuario buscado
  const usernameInput = document.getElementById('username');
  if (usernameInput && usernameInput.value.trim() !== '' && typeof currentUserData !== 'undefined' && currentUserData) {
    renderUserProfile(currentUserData);
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
        .map(username => `<option value="${username}">`)
        .join('');
    } catch (error) {
      console.warn('Error obteniendo sugerencias:', error.message);
    }
  }, 300);
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
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
  document.getElementById('lang-toggle').addEventListener('click', toggleLanguage);
});