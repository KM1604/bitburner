/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("sleep")
  ns.disableLog("getServerMoneyAvailable")
  
  // buy a node if you don't own two yet
  while (ns.hacknet.numNodes() < 2) {
    const nodeCost = ns.hacknet.getPurchaseNodeCost()
    const cashAvail = ns.getServerMoneyAvailable("home")
    if(nodeCost < cashAvail) {
      ns.hacknet.purchaseNode();
    }
    await ns.sleep(10000)
  }
  
  while (true) {
    // is hacknet profitable?
    let totalHacknetCost = ns.getMoneySources().sinceInstall.hacknet_expenses
    let totalHacknetProfit = ns.getMoneySources().sinceInstall.totalHacknetProfit
    let hn_profitable = totalHacknetProfit > totalHacknetCost

    let hnBalanced = !ns.scriptRunning("balancedHacknet.js", "home")

    // buy a node if:
    //   balancehacknet.js is not running
    //   hacknet is profitable even after spending twice the node purchase price
    if (hnBalanced && (await ns.hacknet.getPurchaseNodeCost() * 2) + totalHacknetCost < totalHacknetProfit) {
      ns.hacknet.purchaseNode();
    }

    // create function to calculate relative production of a single node
    const getProduction = (level, ram, cores) => (level * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6);
    
    // calculate current production and potential upgrade production on node0
    const nodeZero = ns.hacknet.getNodeStats(0)
    let curProd = getProduction(nodeZero.level, nodeZero.ram, nodeZero.cores)
    let lvlProd = getProduction(nodeZero.level+1, nodeZero.ram, nodeZero.cores)
    let lvlCost = ns.hacknet.getLevelUpgradeCost(0)
    let lvlBenefit = (lvlProd - curProd) / lvlCost
    let corProd = getProduction(nodeZero.level, nodeZero.ram, nodeZero.cores+1)
    let corCost = ns.hacknet.getCoreUpgradeCost(0)
    let corBenefit = (corProd - curProd) / corCost
    let ramProd = getProduction(nodeZero.level, nodeZero.ram*2, nodeZero.cores)
    let ramCost = ns.hacknet.getRamUpgradeCost(0)
    let ramBenefit = (ramProd - curProd) / ramCost
    let bestBenefit = Math.max(lvlBenefit, ramBenefit, corBenefit)
    let nodeCount = ns.hacknet.numNodes()
    let cashOnHand = ns.getServerMoneyAvailable("home")
    
    // purchase upgrade for best roi if:
    //   nodes already balanced and 
    //   Hacknet is profitable since install
    if (!hnBalanced) {
      ns.print("still balancing nodes, no updates to node0")
    } else if (!hn_profitable) {
      ns.print("Hacknet in the red, no upgrades performed.")
    } else if (cashOnHand > lvlCost * nodeCount && bestBenefit == lvlBenefit) {
      ns.hacknet.upgradeLevel(0,1)
    } else if (cashOnHand > ramCost * nodeCount && bestBenefit == ramBenefit) {
      ns.hacknet.upgradeRam(0,1)
    } else if (cashOnHand > corCost * nodeCount && bestBenefit == corBenefit) {
      ns.hacknet.upgradeCore(0,1)
    }

    // balancehacknet.js loops through all nodes - upgrading all nodes to match node0
    if (hn_profitable && hnBalanced) {
      ns.exec("balancehacknet.js", "home")
    }
    await ns.sleep(30*1000)
  }
}

