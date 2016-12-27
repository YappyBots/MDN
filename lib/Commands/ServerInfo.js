const exec = require("child_process").exec;
const RichEmbed = require("discord.js").RichEmbed;
const Command = require("../Command");

class ServerInfoCommand extends Command {
  constructor(bot) {
    super(bot);
    this.props.help = {
      name: "serverinfo",
      description: "shows some server info",
    };
    this.setConf({
      permLevel: 2,
      aliases: [
        "server_info",
        "serverInfo",
        "server-info",
        "sinfo",
      ],
    });
  }
  async run(msg) {
    const uptime = parseFloat(await this._exec(`awk "{print $1/60/60/24}" /proc/uptime`,
    { timeout: 10e3 }).toString());
    const dataRegex = /RX packets (\d+) {2}bytes (\d+) \((\d+(?:\.\d+ (?:KB|MB|GB)))\)/i;
    const data = await this._exec("ifconfig", { timeout: 10e3 }).toString().match(dataRegex);
    const memoryUsage = await this._exec("free -m | awk 'NR==2{printf \"%s/%sMB (%.2f%%)\n\", $3,$2,$3*100/$2 }'");
    const diskUsage = await this._exec("df -h | awk '$NF==\"/\"{printf \"%d/%dGB (%s)\n\", $3,$2,$5}'");
    const cpuLoad = await this._exec("top -bn1 | grep load | awk '{printf \"%.2f\n\", $(NF-2)}' ");
    const received = parseInt(data[2]);
    const receivedSimple = data[3];
    const receivedPerDay = ((received / 1000 / 1000 / 1000) / uptime).toFixed(2);
    const embed = new RichEmbed()
    .addField("Server Uptime", `${uptime.toFixed(2)} days`)
    .addField("Data Received: Total", receivedSimple)
    .addField("Data Received: Average / Day ", `${receivedPerDay} GB/day`)
    .addField("Memory Usage", memoryUsage)
    .addField("Disk Usage", diskUsage)
    .addField("CPU Load", cpuLoad);
    msg.channel.sendEmbed(embed);
  }
  _exec(cmd, opts = {}) {
    return new Promise((resolve, reject) => {
      exec(cmd, opts, (err, stdout, stderr) => {
        if (err) return reject({ stdout, stderr });
        resolve(stdout);
      });
    });
  }
}


module.exports = ServerInfoCommand;
