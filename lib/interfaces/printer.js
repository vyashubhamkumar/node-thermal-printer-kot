const Interface = require("./interface");
// const electron = typeof process !== 'undefined' && process.versions && !!process.versions.electron;

class Printer extends Interface {
  constructor(printerName, moduleName) {
    super();
    this.name = printerName;
    if (moduleName && typeof moduleName === "object") {
      this.driver = moduleName;
    } else {
      this.driver = require('printer');
    }
  }


  getPrinterName () {
    var name = this.name;
    if (!name || name === "auto") {
      const pl = this.driver.getPrinters().filter(function (p) {
        return p.attributes.indexOf("RAW-ONLY") > -1
      });
      if (pl.length > 0) {
        name = pl[0].name;
      }
    }
    if (!name || name === "auto") {
      throw new Error("A RAW-ONLY Printer could not be detected. Please configure a Printer-Name");
    }
    return name;
  }


  async isPrinterConnected () {
    if (this.driver.getPrinter(this.getPrinterName())) {
      return true;
    } else {
      throw false;
    }
  }

  async execute (buffer, executionConfig) {
    return new Promise((resolve, reject) => {
      let userConfig = executionConfig || {};
      let printDirectConfig = Object.assign({}, userConfig, {
        data: buffer,
        printer: this.getPrinterName(),
        type: "RAW",
        docname: userConfig.docname || "node-print-job",
        success: function (jobID) {
          resolve(jobID);
        },
        error: function (error) {
          reject(error);
        }
      });
      this.driver.printDirect(printDirectConfig);
    });
  }
}

module.exports = Printer;
