include
    ([
        "scripts/handlers.js",
        "scripts/io_func.js",
        "scripts/calc.js",
        "scripts/jszip.js",
        "scripts/save.js",
        "scripts/CDF.js"
    ]);

function include(names)
{
    names.forEach(name =>
    {
        let script = document.createElement("script");
        script.src = name;
        // script.async = false; // if need not async
        document.head.appendChild(script);
    });
}

function alarm(obj)
{
    alert(JSON.stringify(obj, "", 4));
}

window.onload = () =>
{
    set_todays_date();
}

window.onbeforeunload = () =>
{
    return "Не сохранять результаты?"; 
}

// window.onresize = function;
// window.addEventListener("orientationchange", function);