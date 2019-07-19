let f_arr = [];

let t_type =
{
    ypt: 1,
    ynt: 2
};

let settings =
{
    t_type: t_type.ypt,
    f_type: 3
};

let teams_names =
[
    "Команда №1",
    "Команда №2",
    "Команда №3",
    "Команда №4",
];

let brackets =
{
    2:
    [
        [1, 2, 2],
        [2, 1, 1]
    ],
    
    3:
    [
        [1, 2, 3],
        [2, 3, 1],
        [3, 1, 2]
    ],
    
    4:
    [
        [1, 2, 3],
        [2, 3, 4],
        [3, 4, 1],
        [4, 1, 2]
    ]
};

function set_team_name(elem, n)
{
    let name = "Команда ";
    let value = elem.value;
    
    if (value !== "")
    {
        name += "«" + value + "»";
    }
    else
    {
        name += "№" + n;
    }
    
    teams_names[n - 1] = name;
    set_teams_names();
}

function set_teams_names()
{
    let N = settings.f_type;
    let stages = document.getElementsByClassName("stage");
    
    for (let i = 0; i < N; ++i)
    {
        let performances = stages[i].getElementsByClassName("performance");
        
        for (let j = 0; j < 3; ++j)
        {
            let team_name = performances[j].getElementsByClassName("label")[0];
            team_name.innerHTML = teams_names[brackets[N][i][j] - 1];
        }
    }
}

function set_t_type(elem)
{
    let ynt = document.getElementById("ynt");
    let ypt = document.getElementById("ypt");    
    
    switch (Number(elem.value))
    {
        case t_type.ypt:
            ynt.setAttribute("hidden", "");
            ypt.removeAttribute("hidden");
            settings.t_type = t_type.ypt;
        break;

        case t_type.ynt:
            ynt.removeAttribute("hidden");
            ypt.setAttribute("hidden", "");
            settings.t_type = t_type.ynt;
        break;
        
        default:
        alert("Error in set_t_type()");
    }
}

function set_f_type(elem)
{
    let stage_3 = document.getElementsByName("stage-3");
    let stage_4 = document.getElementsByName("stage-4");
    
    switch (Number(elem.value))
    {
        case 2:
            for (let i = 0; i < stage_3.length; ++i)
            {
                stage_3[i].setAttribute("hidden", "");
            }
            
            for (let i = 0; i < stage_4.length; ++i)
            {
                stage_4[i].setAttribute("hidden", "");
            }
            
            settings.f_type = 2;
        break;

        case 3:
            for (let i = 0; i < stage_3.length; ++i)
            {
                stage_3[i].removeAttribute("hidden");
            }
            
            for (let i = 0; i < stage_4.length; ++i)
            {
                stage_4[i].setAttribute("hidden", "");
            }
            
            settings.f_type = 3;
        break;
        
        case 4:
            for (let i = 0; i < stage_3.length; ++i)
            {
                stage_3[i].removeAttribute("hidden");
            }
            
            for (let i = 0; i < stage_4.length; ++i)
            {
                stage_4[i].removeAttribute("hidden");
            }
            
            settings.f_type = 4;
        break;
        
        default:
        alert("Error in set_f_type()");
    }

    set_teams_names();
}

function set_todays_date()
{
    let date = document.getElementById("date");
    
    let now  = Date.now();
    let offset = 60 * 1000 * (new Date(now)).getTimezoneOffset();
    let time = new Date(now - offset);

    date.value = time.toISOString().slice(0, 10);
}