function log_gamma(x)
{
	let sum = 1 + (76.18009173    / (x + 0)) - (86.50532033    / (x + 1)) +
	              (24.01409822    / (x + 2)) - ( 1.231739516   / (x + 3)) +
	              ( 0.00120858003 / (x + 4)) - ( 0.00000536382 / (x + 5));
	              
	let l_g = ((x - 0.5) * Math.log(x + 4.5)) -
	           (x + 4.5) + Math.log(2.50662827465 * sum);
		
	return l_g;
}

function B_inc(x, a, b)
{
	let a_0 = 0;
	let b_0 = 1;
	let a_1 = 1;
	let b_1 = 1;
	let m_9 = 0;
	let a_2 = 0;
	let c_9 = 0;
	let eps = 1e-6;
	
	while (eps < Math.abs((a_1 - a_2) / a_1 ))
	{
		a_2 = a_1;
		c_9 = - x * (a + m_9) * (a + b + m_9) / ((a + 2 * m_9) * (a + 2 * m_9 + 1));
		
		a_0 = a_1 + (a_0 * c_9);
		b_0 = b_1 + (b_0 * c_9);
		
		m_9 += 1;
		c_9 = x * m_9 * (b - m_9) / ((a + 2 * m_9 - 1) * (a + 2 * m_9));
		
		a_1 = a_0 + (a_1 * c_9);
		b_1 = b_0 + (b_1 * c_9);
		
		a_0 /= b_1;
		b_0 /= b_1;
		a_1 /= b_1;
		b_1 = 1;
	}
	
	return (a_1 / a);
}

function B(x, a, b)
{
    let bt = Math.exp(log_gamma(a + b) - log_gamma(a) - log_gamma(b) + 
                      (a * Math.log(x)) + (b * Math.log(1 - x)));
    
    if ( x < ((a + 1) / (a + b + 2)))
    {
    	return (bt * B_inc(x, a, b));
    }
    else
    {
    	return (1 - (bt * B_inc(1 - x, b, a)));
    }
}

function I(xi, a, b)
{
    return (B(xi, a, b) / B(1, a, b));
}

function F(t, n)
{
    let xi_t = n / (t*t + n);
    let a = n / 2;
    let b = 1 / 2;
    
    return (1 - (I(xi_t, a, b) / 2));
}