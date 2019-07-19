let stages =
{
    2:
    [
        [0, 1, 1],
        [1, 0, 0]
    ],
    
    3:
    [
        [0, 2, 1],
        [1, 0, 2],
        [2, 1, 0]
    ],
    
    4:
    [
        [0, 3, 2],
        [1, 0, 3],
        [2, 1, 0],
        [3, 2, 1]
    ]
};

function calculate()
{
    let f = get_json();
    
    f.grades   = [];
    f.sigmas   = {};
    f.t_scores = {};
    f.c_levels = {};
    f.stats    = {};
    
    f.stats.N = f.jurors.length;
    f.stats.n = f.stats.N - ((f.stats.N > 1) ? 1 : 0);
    
    f.stages.forEach((stage, i) =>
    {
        let p = stage.performances;
        
        for (let k in p)
        {
            let min_max_half = (Math.min(...p[k].grades) + Math.max(...p[k].grades)) / 2;
            let coef_s = 1;
            let coef_g = 1;
            let prec = 10;
            
            p[k].average = calc_average(p[k].grades, min_max_half, f.stats.N, f.type);
            p[k].deltas  = calc_deltas(p[k].grades, p[k].average);
            
            if (f.type == "ypt")
            {
                coef_s = ({"rep": 3, "opp": 2, "rev": 1})[k];
                coef_g = ({"rep": f.coefs[i], "opp": 2, "rev": 1})[k];
                prec = 100;
            };
            
            p[k].sigma = calc_sigma(p[k].deltas, p[k].average - min_max_half, coef_s, f.stats.n);
            p[k].grade = Math.round(coef_g * p[k].average * prec) / prec;
        }
    });
    
    let s_gen_2 = 0;
    
    for (let k in f.stages[0].performances)
    {
        let s_2 = f.stages.reduce((sum, stage) =>
        {
            return (sum + Math.pow(stage.performances[k].sigma, 2));
        }, 0) / f.stages.length;
        
        s_gen_2 += s_2;
        f.sigmas[k] = Math.sqrt(s_2);
    }
    
    f.sigmas.gen = Math.sqrt(s_gen_2);
    f.stats.rho  = Math.sqrt(s_gen_2 / f.stats.n);

    f.teams.forEach((t, i) =>
    {
        let sum = ["rep", "opp", "rev"].reduce((sum, k, j) =>
        {
            return (sum + f.stages[stages[f.stages.length][i][j]].performances[k].grade);
        }, 0);
        
        f.grades.push(Math.round(sum * 10) / 10);
    });
    
    let delta_1_2 = calc_delta_1_2(f.grades);
    
    if (f.type == "ynt")
    {
        f.grades.forEach((g, i, arr) =>
        {
            let sum = f.penalties[i].reduce((s, e) => (s + e));
            arr[i] = Math.round(g * (10 - sum)) / 10; 
        });
        
        f.points = calc_v_points(f.grades);
    }
    
    f.t_scores.t_2   =         2 / f.stats.rho;
    f.t_scores.t_10  =        10 / f.stats.rho;
    f.t_scores.t_act = delta_1_2 / f.stats.rho;
    
    f.c_levels.c_2   = F(f.t_scores.t_2,   f.stats.n);
    f.c_levels.c_10  = F(f.t_scores.t_10,  f.stats.n);
    f.c_levels.c_act = F(f.t_scores.t_act, f.stats.n);
    
    f.stats.coef_W   = calc_coef_W(f);
    
    f_arr.push(f);
    
    add_fight_table(f);
    update_tournament_table();

    clear_form();    
}

function calc_coef_W(f)
{
    let grades_arr = f.teams.map((t, i) =>
    {
        let team_grades = ["rep", "opp", "rev"].reduce((arr, k, j) =>
        {
            let grades = f.stages[stages[f.stages.length][i][j]].performances[k].grades;
            arr.push(grades);
            
            return arr;
        }, []);
        
        return team_grades;
    });
    
    let grades = grades_arr.map(team_grades =>
    {
        let sum_grades = [];
        
        for (let i = 0; i < team_grades[0].length; ++i)
        {
            sum_grades[i] = team_grades[0][i] * ((f.type == "ypt") ? 3 : 1) + // rep
                            team_grades[1][i] * ((f.type == "ypt") ? 2 : 1) + // opp
                            team_grades[2][i];                                // rev    
        }
        
        return sum_grades;
    });
    
    let jurors_grades = f.jurors.map((jur, i) =>
    {
        let juror_grades = grades.reduce((arr, g, j) =>
        {
            let grade = {t: j, g: g[i]};
            arr.push(grade);
            
            return arr;
        }, []);
        
        juror_grades.sort((a, b) => (a.g - b.g));

        for (let i = 0; i < juror_grades.length; ++i)
        {
            let j = i;

            while ((j + 1) < juror_grades.length)
            {
                if (juror_grades[j + 1].g == juror_grades[i].g)
                {
                    ++j;
                }
                else
                {
                    break;
                }
            }
            
            let r = (i + j + 2) / 2;
            for (let k = i; k <= j; ++k) juror_grades[k].r = r;
            
            i = j;
        }
        
        juror_grades.sort((a, b) => (b.t - a.t));
        
        return juror_grades;
    });
    
    let ranks = f.teams.reduce((arr, t, i) =>
    {
        let rank = jurors_grades.reduce((sum, juror_grades) =>
        {
            return (sum + juror_grades[i].r);
        }, 0);

        arr.push(rank);

        return arr;
    }, []);
    
    let R = ranks.reduce((s, R_i) => (s + R_i)) / ranks.length;
    
    let S = ranks.reduce((s, R_i) =>
    {
        return (s + Math.pow(R_i - R, 2));
    }, 0);
    
    let n = f.teams.length;
    let m = f.jurors.length;
    
    let coef_W = 12 * S / (m * m * n * ((n * n) - 1));
    
    return coef_W;
}

function calc_average(arr, mmh, N, type)
{
    let s = arr.reduce((s, e) => (s + e));
    
    if (N === 1) return s;
    
    return ((s - mmh) / (N - 1));
}

function calc_deltas(arr, x)
{
    let deltas = arr.map(e => (e - x));
    return deltas;
}

function calc_sigma(arr, d, coef, n)
{
    let d_2 = arr.map(e => e*e);
    let sum = d_2.reduce((s, e) => (s + e));
    let s_2 = (sum + d*d - Math.min(...d_2) - Math.max(...d_2)) * coef * coef / n;
    
    return Math.sqrt(s_2);
}

function calc_delta_1_2(arr_1)
{
    if (arr_1.length < 2) return 0;
    
    let max_1 = Math.max(...arr_1);
    let arr_2 = arr_1.filter(e => (e != max_1));
    
    return (max_1 - Math.max(...arr_2));
}

function calc_v_points(arr)
{
    let max = Math.max(...arr);
    
    let points = arr.map(grade =>
    {
        let diff = max - grade;
        
        if (10 < diff) return 0;
        if ((2 < diff) && (diff < 10)) return 0.5;
        if (diff <= 2) return 1;
    });
    
    return points; 
}

function save_res_in_pdf()
{
    window.print();
}

async function save_res_in_json()
{
    let zip = f_arr.reduce((zip, f) =>
    {
        let name = f.tournament + " (" + f.date + "). " + f.fight + "-" + f.group + ".json";
        zip.file(name, JSON.stringify(f, "", 4));
        return zip;
    }, new JSZip());
    
    let file = await zip.generateAsync({type: "base64"});
    let name = f_arr[0].tournament + " (" + f_arr[0].date + "). " + f_arr[0].fight + ".zip";
    
    save_zip(file, name);  
}