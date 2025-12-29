/** @param {NS} ns */
export async function main(ns) {
    const args = ns.flags([['help', false]]);
    const hack_target = args._[0]
    const thread_count = args._[1]
    ns.print("hacking "+hack_target+" with "+thread_count+" threads")
    await ns.hack(hack_target, {threads:thread_count});
}

