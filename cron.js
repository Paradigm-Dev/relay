const cron = require("cron");
const shell = require("shelljs");

module.exports.initCron = () => {
  let job = new cron.CronJob(
    "0 0 0 * * *",
    () => {
      shell.exec("sudo ./backup.sh");
      console.log(
        "\x1b[32m",
        "[   DB   ]",
        "\x1b[31m",
        moment().format("MM/DD/YYYY, HH:MM:SS"),
        "\x1b[33m",
        `mongodb://${host}:27017`,
        "\x1b[0m",
        "backup completed"
      );
    },
    null,
    true,
    "America/New_York"
  );
  job.start();
};
