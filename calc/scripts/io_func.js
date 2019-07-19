function get_json()
{
    let performances_name = ["rep", "opp", "rev"];
    
    let battle = {};
    battle.type         = "";
    battle.tournament   = document.getElementById("name").value.trim();
    battle.fight        = document.getElementById("fight").value.trim();
    battle.group        = document.getElementById("group").value.trim();
    battle.date         = document.getElementById("date").value.trim();
    battle.chairpersons = [document.getElementById("chairperson").value.trim()];
    
    let jurors_names = document.getElementById("jurors").value;
    battle.jurors    = jurors_names.split("\n").map(s => s.trim());
    
    let teams_names = document.getElementById("teams-names");
    let accepted    = document.getElementById("accepted");
    let rejected    = document.getElementById("rejected");
    let coefs       = document.getElementById("coefs");
    let penalties   = document.getElementById("penalties");
    
    let stages = document.getElementsByClassName("stage");
    
    battle.teams     = [];
    battle.coefs     = [];
    battle.penalties = [];
    battle.stages    = [];
    
    let N = settings.f_type;
    
    for (let i = 0; i < N; ++i)
    {
        battle.teams[i] = teams_names.children[i].value.trim();

        switch (settings.t_type)
        {
            case t_type.ypt:
                battle.type = "ypt";
                battle.coefs[i] = Number(coefs.children[i].value.trim());
                delete battle.penalties;
            break;
            
            case t_type.ynt:
                battle.type = "ynt";
                battle.penalties[i] = penalties.children[i].value.split(" ").map(s => Number(s.trim()));
                delete battle.coefs;
            break;
        }
        
        let stage = {};
        stage.accepted = accepted.children[i].value.trim();
        stage.rejected = rejected.children[i].value.split(" ").map(s => s.trim());
        
        let performances = stages[i].getElementsByClassName("performance");
        stage.performances = {};
        
        for (let j = 0; j < 3; ++j)
        {
            let performance = {};
            performance.team     = teams_names.children[brackets[N][i][j] - 1].value.trim();
            performance.speakers = [performances[j].getElementsByClassName("id-speaker")[0].value.trim()];
            performance.grades   = performances[j].getElementsByClassName("id-grades")[0].value.split(" ").map(s => Number(s.trim()));
            
            stage.performances[performances_name[j]] = performance;
        }
        
        battle.stages[i] = stage;
    }
    
    return battle;
}

function clear_form()
{
    document.getElementById("chairperson").value = "";
    document.getElementById("group").value = "";
    document.getElementById("jurors").value = "";
    
    let teams_names = document.getElementById("teams-names");
    let accepted    = document.getElementById("accepted");
    let rejected    = document.getElementById("rejected");
    let coefs       = document.getElementById("coefs");
    let penalties   = document.getElementById("penalties");
    let stages      = document.getElementsByClassName("stage");
    
    for (let i = 0; i < 4; ++i)
    {
        teams_names.children[i].value = "";
        set_team_name(teams_names.children[i], i + 1);
        
        coefs.children[i].value = "";
        penalties.children[i].value = "";
        accepted.children[i].value = "";
        rejected.children[i].value = "";
        
        let performances = stages[i].getElementsByClassName("performance");
        
        for (let j = 0; j < 3; ++j)
        {
            performances[j].getElementsByClassName("id-speaker")[0].value = "";
            performances[j].getElementsByClassName("id-grades")[0].value = "";
        }
    }
    
    set_teams_names();
}

function add_fight_table(f)
{
    let template = document.getElementById("f-t-template");
    let div = document.createElement("div");
    div.innerHTML = template.outerHTML;
    
    let table = div.children[0];
    table.removeAttribute("id");
    table.removeAttribute("hidden");

    table.getElementsByClassName("section-title")[0].innerHTML += " " + f.group;
    
    if (f.type == "ynt")
    {
        table.getElementsByClassName("penalties")[0].removeAttribute("hidden");
        table.getElementsByClassName("v-points")[0].removeAttribute("hidden");
    }
    else
    {
        let average = table.getElementsByClassName("average");
        for (let i = 0; i < average.length; ++i)
        {
            average[i].removeAttribute("hidden");
        }
        
        table.getElementsByClassName("coef")[0].removeAttribute("hidden");
    }
    
    let section_0 = table.getElementsByClassName("section")[0];
    let jurors_names_box = section_0.getElementsByClassName("subsection")[0];
    
    f.jurors.forEach(juror =>
    {
        jurors_names_box.innerHTML += "<div>" + juror + "</div>";
    });
    
    let stages_names = ["I", "II", "III", "IV"];
    
    f.stages.forEach((s, i) =>
    {
        let div = document.createElement("div");
        div.innerHTML = section_0.getElementsByClassName("subsection-box")[1].outerHTML;
        
        let stage_i = div.children[0];
        stage_i.removeAttribute("id");
        stage_i.removeAttribute("hidden");
        
        stage_i.getElementsByClassName("subsection-title")[0].innerHTML += " " + stages_names[i];
        stage_i.getElementsByClassName("acc")[0].innerHTML += " " + s.accepted;
        
        let rej = "ов нет";
        if (s.rejected[0] !== "")
        {
            rej = "ы: " + s.rejected.join(", ");
        }
        stage_i.getElementsByClassName("rej")[0].innerHTML += rej;
        
        if (f.type == "ypt")
        {
            stage_i.getElementsByClassName("coef")[0].innerHTML += " " + f.coefs[i];
        }
        else
        {
            let penalties = "ы: " + f.penalties[i].join(" ");
            if (penalties == "ы: 0 0 0")
            {
                penalties = "ов нет";
            }
            
            stage_i.getElementsByClassName("penalties")[0].innerHTML += penalties;
        }
        
        let teams_names = stage_i.getElementsByClassName("team-name");
        let speakers    = stage_i.getElementsByClassName("speaker");
        let grades      = stage_i.getElementsByClassName("grades");
        let average     = stage_i.getElementsByClassName("average");
        let grade       = stage_i.getElementsByClassName("grade");
        
        ["rep", "opp", "rev"].forEach((p, j) =>
        {
            let perf = s.performances[p];
            
            teams_names[j].innerHTML += perf.team;
            speakers[j].innerHTML += perf.speakers[0];
            perf.grades.forEach(g =>
            {
                grades[j].innerHTML += "<div>" + g + "</div>"; 
            });
            average[j].innerHTML += perf.average;
            grade[j].innerHTML += perf.grade;
        });
        
        section_0.appendChild(stage_i);
    });
    
    let results = f.teams.map((t, i) =>
    {
        let result =
        {
            team: t,
            grade: f.grades[i]
        };
        
        if (f.type == "ynt")
        {
            result.point = f.points[i];
        };
        
        return result;
    });
    
    results.sort((a, b) => (b.grade - a.grade));
    
    if (f.type == "ynt")
    {
        results.sort((a, b) => (b.point - a.point));
    };
    
    let section_1 = table.getElementsByClassName("section")[1];
    let grades = section_1.getElementsByClassName("grades");
    
    results.forEach(result =>
    {
        grades[0].innerHTML += "<div>" + result.team + "</div>";
        grades[1].innerHTML += "<div>" + result.grade + "</div>";
        
        if (f.type == "ynt")
        {
            grades[2].innerHTML += "<div>" + result.point + "</div>";
        }
    });
    
    let subsection = document.createElement("div");
    subsection.innerHTML = section_1.children[1].children[1].innerHTML;
    section_1.children[1].children[1].innerHTML = "";
    
    div = document.createElement("div");
    div.innerHTML = subsection.children[0].innerHTML;
    subsection.children[0].innerHTML = "";
    
    section_1.children[1].children[1].insertAdjacentHTML("beforeEnd", subsection.innerHTML);
    
    for (let k in f.sigmas)
    {
        let div_i = document.createElement("div");
        div_i.innerHTML = div.innerHTML;
        
        div_i.children[0].children[0].innerHTML += "σ-" + k;
        div_i.children[0].children[1].innerHTML += " = ";
        div_i.children[0].children[2].innerHTML += Math.round(f.sigmas[k] * 1000) / 1000;
        
        section_1.children[1].children[1].children[0].appendChild(div_i.children[0]);
    }
    
    section_1.children[1].children[1].insertAdjacentHTML("beforeEnd", subsection.innerHTML);
    
    let k_name = ["n", "ρ", "W"];
    ["n", "rho", "coef_W"].forEach((k, i) =>
    {
        let div_i = document.createElement("div");
        div_i.innerHTML = div.innerHTML;
        
        div_i.children[0].children[0].innerHTML += k_name[i];
        div_i.children[0].children[1].innerHTML += " = ";
        div_i.children[0].children[2].innerHTML += Math.round(f.stats[k] * 1000) / 1000;
        
        section_1.children[1].children[1].children[1].appendChild(div_i.children[0]);        
    });
    
    section_1.children[1].children[1].insertAdjacentHTML("beforeEnd", subsection.innerHTML);

    let t_name = {t_2: "t-2", t_10: "t-10", t_act: "t-act"};
    for (let k in f.t_scores)
    {
        let div_i = document.createElement("div");
        div_i.innerHTML = div.innerHTML;
        
        div_i.children[0].children[0].innerHTML += t_name[k];
        div_i.children[0].children[1].innerHTML += " = ";
        div_i.children[0].children[2].innerHTML += Math.round(f.t_scores[k] * 1000) / 1000;
        
        section_1.children[1].children[1].children[2].appendChild(div_i.children[0]);        
    }
    
    section_1.children[1].children[1].insertAdjacentHTML("beforeEnd", subsection.innerHTML);
    
    let c_name = {c_2: "c-2", c_10: "c-10", c_act: "c-act"};
    for (let k in f.c_levels)
    {
        let div_i = document.createElement("div");
        div_i.innerHTML = div.innerHTML;
        
        div_i.children[0].children[0].innerHTML += c_name[k];
        div_i.children[0].children[1].innerHTML += " = ";
        div_i.children[0].children[2].innerHTML += Math.round(f.c_levels[k] * 100000) / 1000 + "%";
        
        section_1.children[1].children[1].children[3].appendChild(div_i.children[0]);        
    }
    
    template.insertAdjacentHTML("afterEnd", table.outerHTML);
}

function update_tournament_table()
{
    let results = f_arr.reduce((arr, f) =>
    {
        f.teams.forEach((t, i) =>
        {
            let result = 
            {
                team: t,
                grade: f.grades[i]
            };
            
            if (f.type == "ynt")
            {
                result.point = f.points[i];
            };
            
            arr.push(result);
        });
        
        return arr;
    }, []);
    
    results.sort((a, b) => (b.grade - a.grade));
    
    if (f_arr[0].type == "ynt")
    {
        results.sort((a, b) => (b.point - a.point));
    };
    
    let template = document.getElementById("t-t-template");
    let div = document.createElement("div");
    div.innerHTML = template.outerHTML;
    
    let table = div.children[0];
    table.removeAttribute("id");
    table.removeAttribute("hidden");

    if (f_arr[0].type == "ynt")
    {
        table.getElementsByClassName("ynt")[0].removeAttribute("hidden");
    };
    
    let subsections = table.getElementsByClassName("subsection");
    
    results.forEach(result =>
    {
        subsections[0].innerHTML += "<div>" + result.team + "</div>";
        subsections[1].innerHTML += "<div>" + result.grade + "</div>";
        
        if (f_arr[0].type == "ynt")
        {
            subsections[2].innerHTML += "<div>" + result.point + "</div>";
        }
    });

    template.parentNode.removeChild(template.previousSibling);
    template.insertAdjacentHTML("beforeBegin", table.outerHTML);
}