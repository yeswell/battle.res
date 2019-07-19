function save(file, name)
{  
    let element = document.createElement("a");
    
    element.setAttribute("href", file);
    element.setAttribute("download", name);
    
    element.style.display = "none";
    document.body.appendChild(element);
    
    element.click();
    document.body.removeChild(element);
}

function save_json(json, name)
{
    let file = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json, "", 4));
    
    save(file, name);
}

function save_txt(str, name)
{
    let file = "data:application/json;charset=utf-8," + encodeURIComponent(str);
    
    save(file, name);
}

function save_zip(zip, name)
{
    let file = "data:application/zip;charset=utf-8;base64," + zip;
    
    save(file, name);    
}