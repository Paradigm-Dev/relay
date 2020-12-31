const { Worker } = require("worker_threads");

module.exports = (path, workerData) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path, { workerData });
    worker.on("message", resolve);
    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0)
        reject(
          new Error(`Stopped the Worker Thread with the exit code: ${code}`)
        );
    });
  });
};
