/** @param {NS} ns */
export async function main(ns) {
    ns.disableLog("sleep")
    ns.disableLog("getServerMaxRam")
    ns.disableLog("getServerUsedRam")
    ns.disableLog("getServerSecurityLevel")
    ns.disableLog("getServerMinSecurityLevel")
    ns.disableLog("getServerMoneyAvailable")
    ns.disableLog("getServerMaxMoney")

    const args = ns.flags([['help', false]]);
    const target_server = args._[0];
    const host_name = ns.getHostname();

    const safe_ram = 20

    while (true) {
      const server_sec = await ns.getServerSecurityLevel(target_server)
      const server_sec_min = await ns.getServerMinSecurityLevel(target_server)
      const server_money = await ns.getServerMoneyAvailable(target_server)
      const server_money_max = await ns.getServerMaxMoney(target_server)
      const max_ram = await ns.getServerMaxRam(host_name)
      const used_ram = await ns.getServerUsedRam(host_name)
      ns.print("Security: "+server_sec+"/"+server_sec_min)
      ns.print("Money:    "+Math.floor(100*server_money/server_money_max)+"% of $"+Math.floor(server_money_max/1000000)+"M")
      let thread_count = 1
      if(used_ram * 2 > max_ram) {
        await ns.sleep(1000)
      } else if (server_sec > 2 * server_sec_min || ns.scriptRunning("hack.js", "home")) {
          thread_count = Math.floor((max_ram - used_ram - safe_ram) / await ns.getScriptRam("weaken.js"))
          ns.exec("weaken.js", "home", thread_count, target_server, thread_count);
      } else if (server_money < 0.9 * server_money_max) {
          thread_count = Math.floor((max_ram - used_ram - safe_ram) / await ns.getScriptRam("grow.js"))
          ns.exec("grow.js", "home", thread_count, target_server, thread_count);
      } else if (server_money > server_money_max * 0.9) {
          thread_count = Math.min(Math.floor((max_ram - used_ram - safe_ram) / await ns.getScriptRam("hack.js")), 256) 
          if (!ns.scriptRunning("hack.js", "home")) {
            ns.exec("hack.js", "home", thread_count, target_server, thread_count);
          }
      }
      await ns.sleep(1000)
    }
}

