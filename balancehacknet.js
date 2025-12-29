/** @param {NS} ns */
export async function main(ns) {
  const primaryStats = await ns.hacknet.getNodeStats(0)

  // loop through all nodes, upgrading node1 and beyond to match node0
  for (var index = 1; index < await ns.hacknet.numNodes(); index++) {
    while (await ns.hacknet.getNodeStats(index).cores < primaryStats.cores) {
      if (await ns.getServerMoneyAvailable("home") > await ns.hacknet.getCoreUpgradeCost(index)) {
        await ns.hacknet.upgradeCore(index, 1);
        await ns.sleep(100);
      }
      else {
        await ns.sleep(10000)
      }
    }
    while (await ns.hacknet.getNodeStats(index).ram < primaryStats.ram) {
      if (await ns.getServerMoneyAvailable("home") > await ns.hacknet.getRamUpgradeCost(index)) {
        await ns.hacknet.upgradeRam(index, 1);
        await ns.sleep(100);
      }
      else {
        await ns.sleep(10000)
      }
    }
    while (await ns.hacknet.getNodeStats(index).level < primaryStats.level) {
      if (await ns.getServerMoneyAvailable("home") > await ns.hacknet.getLevelUpgradeCost(index)) {
        await ns.hacknet.upgradeLevel(index, 1);
        await ns.sleep(100);
      }
      else {
        await ns.sleep(10000)
      }
    }
    await ns.sleep(100);
  }
}

