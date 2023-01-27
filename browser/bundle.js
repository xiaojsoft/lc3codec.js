//
//  Copyright 2021 - 2023 XiaoJSoft Studio. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const FS = require("fs");
const Path = require("path");

//
//  Constants.
//

//  Build configurations.
const CONFIG_GLOBAL = "window";
const CONFIG_NAMESPACE = "LC3";
const CONFIG_OUTFILE = Path.join(__dirname, "dist", "lc3.js");

//
//  Main.
//
(function() {
    //  Read template.
    let template = FS.readFileSync(Path.join(__dirname, "template.txt"), {
        "encoding": "utf-8"
    });

    //  Read module list.
    let module_list = JSON.parse(FS.readFileSync(
        Path.join(__dirname, "modules.json"), 
        {
            "encoding": "utf-8"
        }
    ));

    //  Generate script.
    let module_root = Path.join(__dirname, "..");
    let module_generated = "{\n";
    for (let i = 0; i < module_list.length; ++i) {
        let module_name = module_list[i];
        let module_content = FS.readFileSync(
            Path.join(module_root, module_name + ".js"),
            {
                "encoding": "utf-8"
            }
        );
        module_generated += "    \"" + module_name + "\": function(module, require) {\n";
        module_generated += module_content;
        if (!module_generated.endsWith("\n")) {
            module_generated += "\n";
        }
        if (i + 1 != module_list.length) {
            module_generated += "    },\n";
        } else {
            module_generated += "    }\n";
        }
    }
    module_generated += "}";
    let output = template;
    output = output.replace("${BUILD_GLOBAL}", CONFIG_GLOBAL);
    output = output.replace("${BUILD_NAMESPACE}", CONFIG_NAMESPACE);
    output = output.replace("${BUILD_MODULE_DATA}", module_generated);
    
    //  Write output file.
    FS.writeFileSync(CONFIG_OUTFILE, output, {
        "encoding": "utf-8"
    });
})();