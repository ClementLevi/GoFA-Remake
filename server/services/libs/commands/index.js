const { log } = require("console");
const fs = require("fs");
const jsdoc = require("jsdoc-api");
const pm2 = require("pm2");

/**
 * Display all available command and arguments required.
 */
function help() {
    const sourceCode = fs.readFileSync(__filename, "utf8");
    const parsed = jsdoc.explainSync({ source: sourceCode });

    parsed
        .filter((item) => item.kind === "function")
        .forEach((item) => {
            // console.log(item);
            console.log(`[ ${item.longname} ]`);
            console.log(item.description);
            if (item.params.length) {
                console.log("Parameters:");
                item.params.forEach((param) => {
                    console.log(
                        `- ${param.name} {${param.type["names"]}}: ${param.description}`
                    );
                });
            }

            if (item.returns) {
                console.log(`Returns: ${item.returns[0].description}`);
            }
            console.log();
        });
}
/**
 * This will reboot the whole server
 */
function reboot() {
    console.log("This will reboot the whole server");
}

reboot();
module.exports = {
    help,
    reboot,
};
