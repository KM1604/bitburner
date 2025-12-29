/** @param {NS} ns */
export async function main(ns) {
  const args = ns.flags([['help', false]]);
  const target_server = args._[0];
  ns.tprint("min sec "+ns.getServerMinSecurityLevel(target_server))
  ns.tprint("max mon "+ns.getServerMaxMoney(target_server))
  ns.tprint("tar val "+0.000001 * ns.getServerMaxMoney(target_server)/ns.getServerMinSecurityLevel(target_server))
}

