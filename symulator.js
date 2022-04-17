var log = function (a) {
    if (a <= 0) return 0;
    return Math.log2(a);
};
function compare_entropia(a, b) {
    return a.entropia - b.entropia;
}
var entropia_przenoszenia = log(10);
var entropia_pozyczania = log(10);
var entropia_dodawania = log(45);
var entropia_odejmowania = log(81);
var entropia_mnozenia = log(36);
var entropia_dopelnienia = log(10);
var entropia_kwadrat1 = log(10);
var entropia_kwadrat2 = log(90);
var entropia_dzielenia = log(800);
var entropia_dzielenia2 = log(80000);
var entropia_dzielenia3 = log(8000000);
var entropia_szecianu = log(10);
//tablice do preprocessingu
var dod = new Array(10);
var dodp = new Array(10);
var od = new Array(10);
var odp = new Array(10);
var mn = new Array(10);
var MAX_DEEP = 3;
var PREP_MAX = 1000;
var prep = new Array(PREP_MAX);
preprocess_1x1();
preprocess_nx1();
//preprocessing tabliczki mnozenia, dodawania i odejmowania liczb jednocyfrowych
function preprocess_1x1() {
    for (var i = 0; i < 10; ++i) {
        dod[i] = new Array(10);
        dodp[i] = new Array(10);
        od[i] = new Array(10);
        odp[i] = new Array(10);
        mn[i] = new Array(10);
        for (var j = 0; j < 10; ++j) {
            if (i * j == 0) dod[i][j] = 0;
            else dod[i][j] = entropia_dodawania;
            dodp[i][j] = dod[i][j] + entropia_przenoszenia;
            if (j == 0 || j == i) {
                od[i][j] = 0;
                odp[i][j] = entropia_pozyczania;
            }
            else if (j == i - 1 || j == i + 9) {
                od[i][j] = entropia_odejmowania;
                odp[i][j] = 0;
            }
            else {
                od[i][j] = entropia_odejmowania;
                odp[i][j] = entropia_odejmowania + entropia_pozyczania;
            }
            if (i > 1 && j > 1) mn[i][j] = entropia_mnozenia;
            else mn[i][j] = 0;
        }
    }
}
//preprocessing wszytkich mnozen liczb 3x1 cyfrowych
function preprocess_nx1() {
    MAX_DEEP = 4;
    for (var i = 0; i < PREP_MAX; ++i) {
        prep[i] = new Array();
        for (var j = 0; j < 10; ++j) {
            var s = symuluj_mnozenie(i, j);
            prep[i][j] = {};
            prep[i][j].entropia = s.entropia;
            prep[i][j].opis = s.opis;
            var xd = log(900);
            if (i >= 10 && i < 100 && prep[i][j].entropia > xd) prep[i][j].entropia = (xd + prep[i][j].entropia) / 2;
        }
    }
    MAX_DEEP = 3;
}
//zamiana liczby na talice cyfr
function tablica(x) {
    var wyn = [];
    while (x > 0) {
        wyn.push(x % 10);
        x = ~~(x / 10);
    }
    if (wyn.length == 0) {
        wyn.push(0);
    }
    return wyn;
}
//zamiana tablicy cyfr na liczbe
function liczba(tab) {
    var wyn = 0;
    for (var i = tab.length - 1; i >= 0; --i) {
        wyn *= 10;
        wyn += tab[i];
    }
    return wyn;
}
//dopisywanie zer z przodu, aby zrownac dlugosc liczb
function dopisz_zera(taba, tabb, dodatkowe) {
    while (taba.length < tabb.length) {
        taba.push(0);
    }
    while (tabb.length < taba.length) {
        tabb.push(0);
    }
    if (dodatkowe == undefined) {
        dodatkowe = taba.length;
    }
    for (var i = 0; i < dodatkowe; ++i) {
        taba.push(0);
        tabb.push(0);
    }
}
function przygotuj(a, b) {
    var ta = tablica(a);
    var tb = tablica(b);
    dopisz_zera(ta, tb, 0);
    return [ta, tb];
}
function wykonaj_dodawanie(a, b, czy_przenosilem) {
    var entropia;
    if (czy_przenosilem == 0) {
        entropia = dod[a][b];
        if (a + b < 10) czy_przenosze = 0;
        else czy_przenosze = 1;
    }
    else {
        entropia = dodp[a][b];
        if (a + b + 1 < 10) czy_przenosze = 0;
        else czy_przenosze = 1;
    }
    return [entropia, czy_przenosze];
}
function wykonaj_odejmowanie(a, b, czy_pozyczalem) {
    var entropia;
    if (czy_pozyczalem == 0) {
        entropia = od[a][b];
        if (a - b < 0) czy_pozyczam = 1;
        else czy_pozyczam = 0;
    }
    else {
        entropia = odp[a][b];
        if (a - b - 1 < 0) czy_pozyczam = 1;
        else czy_pozyczam = 0;
    }
    return [entropia, czy_pozyczam];
}
/*  stan=0  liczba ma same 0 na koncu
    stan=1  zwykly stan
    stan=9  liczba ma same 9 na poczatku*/
function sprawdz_stan(stan, c, ile9) {
    var d = 9 - c;
    var t = 0;
    if (stan == 0) {
        if (c != 0) {
            stan = 1;
            d = 10 - c;
            t = entropia_dopelnienia;
        }
    }
    else if (stan == 1) {
        if (c == 9) {
            stan = 9;
            ile9 = 1;
        }
        else t = entropia_dopelnienia;
    }
    else {
        if (c == 9) {
            ++ile9;
        }
        else {
            stan = 1;
            t = (ile9 + 1) * entropia_dopelnienia;
            ile9 = 0;
        }
    }
    return [stan, t, d, ile9];
}
/*Oblicza entropie potrzebny na dodawanie lub odejmowanie liczb dodatnich
Uwzglednia czesciowe zamienianie dodawania na odejmowanie i na odwrot np. 176 + 2995 = 176 + 3000 - 5*/
function dodawanie_odejmowanie(a, b, op) {
    var taba = [], tabb = [];
    [taba, tabb] = przygotuj(a, b);
    var n = taba.length;
    var czy_przenosze = 0;
    var czy_pozyczam = 0;
    var entropia = 0;
    var entropia2 = entropia_przenoszenia;
    var stan = 0;
    var ile9 = 0;
    var min_bilans = 0;
    var t, db;
    for (var i = 0; i < n; ++i) {
        var ca = taba[i];
        var cb = tabb[i];
        if (op == '+') [t, czy_przenosze] = wykonaj_dodawanie(ca, cb, czy_przenosze);
        else[t, czy_pozyczam] = wykonaj_odejmowanie(ca, cb, czy_pozyczam);
        entropia += t;
        [stan, t, db, ile9] = sprawdz_stan(stan, cb, ile9);
        entropia2 += t;
        if (op == '+') [t, czy_pozyczam] = wykonaj_odejmowanie(ca, db, czy_pozyczam);
        else[t, czy_przenosze] = wykonaj_dodawanie(ca, db, czy_przenosze);
        entropia2 += t;
        var bilans = entropia2 - entropia;
        if (bilans < min_bilans) min_bilans = bilans;
    }
    entropia += min_bilans;
    return entropia;
}
function symuluj_dodawanie(a, b) {
    var entropia;
    var entropia2 = Infinity;
    if (a < 0) {
        if (b < 0) {
            entropia = dodawanie_odejmowanie(-a, -b, '+');
            entropia2 = dodawanie_odejmowanie(-b, -a, '+');
        }
        else {
            if (Math.abs(a) > Math.abs(b)) entropia = dodawanie_odejmowanie(-a, b, '-');
            else entropia = dodawanie_odejmowanie(b, -a, '-');
        }
    }
    else {
        if (b < 0) {
            if (Math.abs(b) > Math.abs(a)) entropia = dodawanie_odejmowanie(-b, a, '-');
            else entropia = dodawanie_odejmowanie(a, -b, '-');
        }
        else {
            entropia = dodawanie_odejmowanie(a, b, '+');
            entropia2 = dodawanie_odejmowanie(b, a, '+');
        }
    }
    if (entropia2 < entropia) entropia = entropia2;
    return entropia;
}
function symuluj_odejmowanie(a, b) {
    return symuluj_dodawanie(a, -b);
}
//oblicza entropie mnozenia przez liczbe 1-cyfrowa podstawowa metoda np. 34 * 7 = 30 * 7 + 4 * 7
function mnozenie_nx1_podst(a, b) {
    var taba = tablica(a);
    var entropia = 0;
    var suma = 0;
    for (var i = taba.length - 1; i >= 0; --i) {
        var ca = taba[i];
        var akt = ca * b;
        if (i == taba.length - 1 || ca != taba[i + 1]) entropia += mn[ca][b];
        suma *= 10;
        entropia += symuluj_dodawanie(suma, akt);
        suma += akt;
    }
    return entropia;
}
/*Oblicza dopelnienie liczby (tablicy) i entropie jego policzenia.
Dopelnienie to roznica miedzy dana liczba a najblizsza potega 10 wieksza od danej  liczby np. dopelnienie 565 to 435 */
function dopelnienie(ta) {
    var entropia = 0;
    var taba = ta.slice();
    var imin = 0;
    var imax = taba.length - 1;
    while (imin < imax && taba[imin] == 0) ++imin;
    while (imin < imax && taba[imax] == 9) --imax;
    var n = taba.length;
    for (var i = 0; i < n; ++i) {
        if (entropia == 0) {
            if (taba[i] != 0) {
                if (imin <= i && i <= imax) {
                    entropia += entropia_dopelnienia;
                }
                taba[i] = 10 - taba[i];
            }
        }
        else {
            if (imin <= i && i <= imax) {
                entropia += entropia_dopelnienia;
            }
            taba[i] = 9 - taba[i];
        }
    }
    var wynik = liczba(taba);
    return { entropia, wynik };
}
//oblicza entropie mnozenia przez liczbe 1-cyfrowa metoda na odejmowanie np. 596 * 3 = 600 * 3 - 4 * 3
function mnozenie_nx1_przez_odejmowanie(a, b) {
    var taba = tablica(a);
    var entropia = Infinity;
    var pref = [];
    var suf = taba.slice();
    var ll, pp;
    for (var i = 0; i < taba.length - 1; ++i) {
        pref.push(taba[i]);
        suf[i] = 0;
        ++suf[i + 1];
        var dop_pref = dopelnienie(pref);
        var lewy = liczba(suf);
        var prawy = dop_pref.wynik;
        var mnoz_suf = mnozenie_nx1_podst(lewy, b);
        var mnoz_pref = mnozenie_nx1_podst(prawy, b);
        var aktentropia = entropia_przenoszenia + dop_pref.entropia + mnoz_suf + mnoz_pref + symuluj_odejmowanie(lewy * b, prawy * b);
        if (aktentropia < entropia) {
            entropia = aktentropia;
            ll = lewy;
            pp = prawy;
        }
        --suf[i + 1];
    }
    return { entropia, ll, pp };
}
function mnozenie_przez2(a) {
    return symuluj_dodawanie(a, a);
}
function mnozenie_przez9(a) {
    return symuluj_odejmowanie(a * 10, a);
}
/* Oblicza entropie mnozenia metoda na grupowanie np. 3837 * 7
38 * 7 = 266
37 * 7 mozna obliczyc korzystajac z poprzedniego wyniku 37 * 7 = 266 - 7 = 259 */
function mnozenie_nx1_przez_grupowanie(a, b) {
    var entropia = Infinity;
    var ll, pp;
    if (a < 1000) return { entropia, ll, pp };
    var taba = tablica(a);
    var pref = [];
    var suf = taba.slice();
    suf[0] = suf[1] = suf[2] = 0;
    for (var i = 0; i < taba.length - 3; ++i) {
        if (i > 0) pref.push(taba[i - 1]);
        suf[i + 3] = 0;
        if (taba[i] == taba[i + 2] || taba[i + 1] == taba[i + 3]) {
            var lewy = liczba(suf);
            var prawy = liczba(pref);
            var srl = taba[i] + taba[i + 1] * 10;
            var srp = taba[i + 2] + taba[i + 3] * 10;
            var roz = srl - srp;
            var zap = srp * b;
            var rb = roz * b;
            var lb = lewy * b;
            var razem = (zap * 101 + rb) * Math.pow(10, i);
            var aktentropia = mnozenie_nx1_podst(lewy, b) + mnozenie_nx1_podst(srp, b) + mnozenie_nx1_podst(prawy, b) + mnozenie_nx1_podst(roz, b);
            aktentropia += symuluj_odejmowanie(srl, srp) + symuluj_dodawanie(zap, rb) + symuluj_dodawanie(zap * 100, zap + rb);
            aktentropia += symuluj_dodawanie(lb, razem) + symuluj_dodawanie(lb + razem, prawy * b);
            if (aktentropia < entropia) {
                entropia = aktentropia;
                ll = lewy;
                pp = prawy;
            }
        }
    }
    return { entropia, ll, pp };
}
//opisy metod, ktore sa wyswietlane po udzieleniu poprawnej odpowiedzi
function opis_podst(a, b) {
    var opis = a + ' * ' + b + ' = ';
    var tb = tablica(b);
    for (var i = tb.length - 1; i >= 0; --i) {
        opis += a + ' * ' + (tb[i] * Math.pow(10, i));
        if (i != 0) opis += ' + ';
    }
    return opis;
}
function opis_dod(a, b, ll, pp) {
    var opis = a + ' * ' + b + ' = ';
    opis += a + ' * ' + ll + ' + ' + a + ' * ' + pp;
    return opis;
}
function opis_odej(a, b, ll, pp) {
    var opis = a + ' * ' + b + ' = ';
    opis += a + ' * ' + ll + ' - ' + a + ' * ' + pp;
    return opis;
}
function opis_grup(a, b, ll, pp) {
    var opis = a + ' * ' + b + ' = ';
    var s = a - ll - pp;
    while (s > 10000) s = ~~(s / 10);
    var sl = ~~(s / 100);
    var sp = s - sl * 100;
    var sl100 = sl * 100;
    if (ll != 0) opis += b + ' * ' + ll + ' + ';
    opis += b + ' * ' + sl100 + ' + ' + b + ' * ' + sp;
    if (pp != 0) opis += ' + ' + b + ' * ' + pp;
    opis += '\n' + b + ' * ' + sl100 + ' = ' + (b * sl100);
    opis += '\n' + sp + ' - ' + sl + ' = ' + (sp - sl);
    opis += '\n' + b + ' * ' + sp + ' = ' + (b * sl) + ' + ' + b + ' * ' + (sp - sl);
    return opis;
}
function opis_2(a) {
    var opis = a + ' * 2 = ' + a + ' + ' + a;
    return opis;
}
function opis_9(a) {
    var opis = a + ' * 9 = ' + (10 * a) + ' - ' + a;
    return opis;
}
function opis_rkw(a, b, tryb) {
    var opis = a + ' * ' + b + ' = ';
    b += tryb;
    var mniejsza, wieksza, polroz, polsum;
    [mniejsza, wieksza, polroz, polsum] = przygotuj_rkw(a, b);
    opis += polsum + '^2';
    if (polroz != 0) opis += ' - ' + polroz + '^2';
    if (tryb == -1) opis += ' + ' + a;
    if (tryb == 1) opis += ' - ' + a;
    return opis;
}
function opis_kw_ben(a, baza) {
    var r, dr, p;
    [r, dr, p] = rdrp(a, baza);
    var opis = a + '^2 = ';
    if (p != 5) {
        if (r >= 0) opis += baza + ' * ' + dr + ' + ' + r + '^2';
        else opis += baza + ' * ' + dr + ' + ' + (-r) + '^2';
    }
    else {
        if (r >= 0) opis += (baza * baza) + ' + ' + (2 * baza * r) + ' + ' + r + '^2';
        else opis += (baza * baza) + ' - ' + (2 * baza * (-r)) + ' + ' + (-r) + '^2';
    }
    return opis;
}
function opis_baz(a, b, baza) {
    var opis = a + ' * ' + b + ' = ' + (a + b - baza) + ' * ' + baza + ' + ' + (a - baza) + ' * ' + (b - baza);
    return opis;
}
function opis_czyn(a, b, czynnik) {
    var opis = a + ' * ' + b + ' = ' + a + ' * ' + czynnik + ' * ' + (b / czynnik);
    return opis;
}
function opis_dziel(a, b, czynnik) {
    var opis = a + ' * ' + b + ' = ' + a + ' * ' + (b * czynnik) + ' / ' + czynnik;
    return opis;
}
//usuwa zera na koncu mnozonych liczb
function uprosc(a, b) {
    while (a % 10 == 0 && a != 0) a = ~~(a / 10);
    while (b % 10 == 0 && b != 0) b = ~~(b / 10);
    return [a, b];
}
//znajduje entropie i najlepsza metode mnozenia przez liczbe jednocyfrowa
function mnozenie_nx1(a, b) {
    [a, b] = uprosc(a, b);
    if (a < b) [a, b] = [b, a];
    var podst = mnozenie_nx1_podst(a, b);
    var odej = mnozenie_nx1_przez_odejmowanie(a, b);
    var gr = mnozenie_nx1_przez_grupowanie(a, b);
    var spec = Infinity;
    if (b == 2) spec = mnozenie_przez2(a);
    else if (b == 9) spec = mnozenie_przez9(a);
    var entropia = podst;
    var opis;
    var opis = opis_podst(b, a);
    if (odej.entropia < entropia) {
        entropia = odej.entropia;
        opis = opis_odej(b, a, odej.ll, odej.pp);
    }
    if (gr.entropia < entropia) {
        entropia = gr.entropia;
        opis = opis_grup(a, b, gr.ll, gr.pp);
    }
    if (spec < entropia) {
        entropia = spec;
        if (b == 2) opis = opis_2(a);
        else opis = opis_9(a);
    }
    return { entropia, opis };
}
//zaokragla liczbe do ustalonej wielokrotnosci
function najblizsze(a, wiel) {
    return (~~(a / wiel + 0.5)) * wiel;
}
//znajduje pierwsza cyfre liczby
function pierwsza_cyfra(x) {
    while (x > 9) x = ~~(x / 10);
    return x;
}
function rdrp(a, baza) {
    var r = a - baza;
    var dr = a + r;
    var p = pierwsza_cyfra(baza);
    return [r, dr, p];
}
/* Oblicza entropie potrzebna na podniesienie liczby do kwadratu ze wzoru skroconego mnozenia (a + b)^2 = a(a + 2b) + b^2
  np. 92^2 = (100 - 8)^2 = 100 * 84 + 8^2 */
function kw_baza(a, baza) {
    var r, dr, p;
    [r, dr, p] = rdrp(a, baza);
    var entropia = 0;
    var pot = baza / p;
    if (p != 5) {
        if (Math.abs(r) <= 0.5 * pot) entropia += log(0.5 * pot);
        else entropia += log(pot);
        entropia += mnozenie_nx1(baza, dr).entropia;
    }
    else entropia += symuluj_dodawanie(baza / 2, r);
    entropia += symuluj_kwadrat(r).entropia;
    entropia += symuluj_dodawanie(baza * dr, r * r);
    return entropia;
}
function kwadrat_ben(a, wiel) {
    var bl = najblizsze(a, wiel);
    var przez_najb_wiel = kw_baza(a, bl);
    var entropia = przez_najb_wiel;
    var opis;
    var spec = Infinity;
    if (a > wiel && a < 2 * wiel) {
        spec = kw_baza(a, wiel);
        opis = opis_kw_ben(a, wiel);
    }
    else if (a > 4 * wiel && a < 6 * wiel) {
        spec = kw_baza(a, 5 * wiel);
        opis = opis_kw_ben(a, 5 * wiel);
    }
    else if (a > 9 * wiel && a < 10 * wiel) {
        spec = kw_baza(a, 10 * wiel);
        opis = opis_kw_ben(a, 10 * wiel);
    }
    if (spec < entropia) entropia = spec;
    else opis = opis_kw_ben(a, bl);
    return { entropia, opis };
}
//znajduje entropie i najlepsza metode podnoszenia liczby do kwadratu
function symuluj_kwadrat(a) {
    if (a < 0) a *= -1;
    while (a % 10 == 0 && a != 0) a = ~~(a / 10);
    var entropia, opis = '', x;
    if (a < 10) entropia = entropia_kwadrat1;
    else if (a < 100) entropia = entropia_kwadrat2;
    else {
        x = kwadrat_ben(a, rzad_wielkosci(a));
        entropia = x.entropia;
        opis = x.opis;
    }
    return { entropia, opis };
}
function podzial_liczby(x) {
    var rb = rzad_wielkosci(x);
    var l = (~~(x / rb)) * rb;
    var p = x % 10;
    return [rb, l, p];
}
//oblicza entropie potrzebna na mnozenie metoda na dodawanie np. 65 * 92 = 65 * 90 + 65 * 2
function mnozenie_przez_dodawanie(a, b, deep) {
    var rb, l, p;
    [rb, l, p] = podzial_liczby(b);
    var ll, pp, entropia, t1, t2 = Infinity, t3;
    t1 = symuluj_mnozenie(a, l, deep).entropia + symuluj_mnozenie(a, b - l, deep).entropia + symuluj_dodawanie(a * l, a * (b - l));
    if (b > 100) t2 = symuluj_mnozenie(a, b - p, deep).entropia + symuluj_mnozenie(a, p, deep).entropia + symuluj_dodawanie(a * (b - p), a * p);
    t3 = symuluj_mnozenie(a, b - 1, deep).entropia + symuluj_dodawanie(a * (b - 1), a) + entropia_pozyczania;
    entropia = t1;
    ll = l;
    pp = b - l;
    if (t2 < t1) {
        entropia = t2;
        ll = b - p;
        pp = p;
    }
    if (t3 < t1) {
        entropia = t3;
        ll = b - 1;
        pp = 1;
    }
    return { entropia, ll, pp };
}
//oblicza entropie potrzebna na mnozenie metoda na odejmowanie np. 77 * 29 = 77 * 30 - 77 * 1
function mnozenie_przez_odejmowanie(a, b, deep) {
    var rb, l, p;
    if (b == 9) {
        entropia = mnozenie_przez9(a);
        ll = 10;
        pp = 1;
        return { entropia, ll, pp }
    }
    [rb, l, p] = podzial_liczby(b);
    var ll, pp, entropia, t1, t2 = Infinity, t3, t4, dopp;
    var dopl = dopelnienie(tablica(b - l));
    var dopb = dopelnienie(tablica(b));
    if (b > 100 && dopl.wynik < 10) dopl.wynik += 90;
    t1 = entropia_przenoszenia + dopl.entropia + symuluj_mnozenie(a, l + rb, deep).entropia + symuluj_mnozenie(a, dopl.wynik, deep).entropia + symuluj_odejmowanie(a * (l + rb), a * dopl.wynik);
    if (b > 100) {
        dopp = dopelnienie(tablica(p));
        t2 = entropia_przenoszenia + dopp.entropia + symuluj_mnozenie(a, b - p + 10, deep).entropia + symuluj_mnozenie(a, dopp.wynik, deep).entropia + symuluj_odejmowanie(a * (b - p + 10), a * dopp.wynik);
    }
    t3 = dopb.entropia + symuluj_mnozenie(a, dopb.wynik, deep).entropia + symuluj_odejmowanie(a * rb * 10, a * dopb.wynik);
    t4 = symuluj_mnozenie(a, b + 1, deep).entropia + symuluj_odejmowanie(a * (b + 1), a) + entropia_przenoszenia;
    entropia = t1;
    ll = l + rb;
    pp = dopl.wynik;
    if (t2 < entropia) {
        entropia = t2;
        ll = b - p + 10;
        pp = dopp.wynik;
    }
    if (t3 < entropia) {
        entropia = t3;
        ll = 10 * rb;
        pp = dopb.wynik;
    }
    if (t4 < entropia) {
        entropia = t4;
        ll = b + 1;
        pp = 1;
    }
    return { entropia, ll, pp };
}
function przygotuj_rkw(a, b) {
    if (a < b) {
        mniejsza = a;
        wieksza = b;
    }
    else {
        mniejsza = b;
        wieksza = a;
    }
    var polroz = (wieksza - mniejsza) / 2;
    var polsum = mniejsza + polroz;
    return [mniejsza, wieksza, polroz, polsum];
}
/* (a + b)(a - b) = a^2 - b^2
    oblicza entropie potrzebna na mnozenie metoda roznicy kwadratow np. 67 * 73 = 70^2 - 3^2 */
function mnozenie_przez_rkw(a, b, deep) {
    var mniejsza, wieksza, polroz, polsum;
    [mniejsza, wieksza, polroz, polsum] = przygotuj_rkw(a, b);
    var roz = 2 * polroz;
    var entropia = 0, entropia2, tryb;
    if ((roz) % 2 == 0) {
        tryb = 0;
        //dwa pierwsze warunki eksperymentalne
        if (roz == 20 || roz == 40 || roz == 60) {
            entropia += log(135);
        }
        else if (roz <= 10) {
            entropia += log(15 * roz + 40);
        }
        else {
            entropia += symuluj_odejmowanie(wieksza, mniejsza) + log(1 + 2 * polroz);
            entropia += Math.min(symuluj_dodawanie(mniejsza, polroz), symuluj_odejmowanie(wieksza, polroz));
        }
        entropia += symuluj_kwadrat(polsum).entropia + symuluj_kwadrat(polroz).entropia + symuluj_odejmowanie(polsum * polsum, polroz * polroz);
    }
    else {
        tryb = -1;
        entropia = mnozenie_przez_rkw(a, b - 1, deep).entropia + symuluj_dodawanie(a * (b - 1), a);
        entropia2 = mnozenie_przez_rkw(a, b + 1, deep).entropia + symuluj_odejmowanie(a * (b + 1), a);
        if (entropia2 < entropia) {
            entropia = entropia2;
            tryb = 1;
        }
    }
    return { entropia, tryb };
}
function entropia_bazowej(a, b, deep, baza) {
    var w = a + b - baza;
    var entropia = symuluj_odejmowanie(a, baza) + symuluj_odejmowanie(b, baza);
    entropia += Math.min(symuluj_dodawanie(a, b - baza), symuluj_dodawanie(b, a - baza));
    entropia += symuluj_mnozenie(w, baza, deep).entropia;
    entropia += symuluj_mnozenie(a - baza, b - baza, deep).entropia;
    entropia += symuluj_dodawanie(w * baza, (a - baza) * (b - baza));
    return entropia;
}
/* (a + b)(a + c)=a(a + b + c) + bc
   oblicza entropie potrzebna na mnozenie metoda bazowa np. 83 * 87 = (80 + 3) * (80 + 7) = 80 * 90 + 3 * 7*/
function mnozenie_bazowe(a, b, deep) {
    var rb = rzad_wielkosci(b);
    var b1 = (~~(b / rb)) * rb;
    var b2 = b1 + rb;
    var b3 = 10 * rb;
    var entropia = entropia_bazowej(a, b, deep, b1);
    var baza = b1;
    var t2 = entropia_bazowej(a, b, deep, b2);
    var t3 = entropia_bazowej(a, b, deep, b3);
    if (t2 < entropia) {
        entropia = t2;
        baza = b2;
    }
    if (t3 < entropia) {
        entropia = t3;
        baza = b3;
    }
    return { entropia, baza };
}
//oblicza entropie potrzebna na mnozenie metoda czynnikow np. 67 * 36 = 67 * (3 * 12) = 67 * 3 * 12 = 201 * 12
function mnozenie_przez_czynniki(a, b, deep) {
    var entropia = Infinity, czynnik, w1, w2, w3, c2;
    if (b > 1000) return { entropia, czynnik };
    for (var i = 2; i * i <= b; ++i) {
        if (b % i == 0) {
            c2 = b / i;
            w1 = symuluj_mnozenie(a, c2, deep).entropia + symuluj_mnozenie(a * c2, i, deep).entropia;
            w2 = symuluj_mnozenie(a, i, deep).entropia + symuluj_mnozenie(a * i, c2, deep).entropia;
            w3 = Math.min(w1, w2);
            if (w3 < entropia) {
                entropia = w3;
                if (w1 < w2) czynnik = c2;
                else czynnik = i;
            }
        }
    }
    entropia += log(b);
    return { entropia, czynnik };
}
//oblicza entropie potrzebna na mnozenie przez wielokrotnosc 25 lub 125 np. 16 * 25 = 16 * (100 / 4) = 1600 / 4
function mnozenie_przez_dzielenie(a, b, deep) {
    var entropia = Infinity, t, czynnik;
    if (b > 1000) return { entropia, wynik };
    if (b % 25 == 0) {
        t = symuluj_mnozenie(a, 4 * b, deep).entropia + symuluj_dzielenie(a * b * 4, 4);
        if (t < entropia) {
            entropia = t;
            czynnik = 4;
        }
    }
    if (b % 125 == 0) {
        t = symuluj_mnozenie(a, 8 * b, deep).entropia + symuluj_dzielenie(a * b * 8, 8);
        if (t < entropia) {
            entropia = t;
            czynnik = 8;
        }
    }
    return { entropia, czynnik };
}
function pomnoz(a, b, deep, entropia, opis) {
    var przez_dodawanie = mnozenie_przez_dodawanie(a, b, deep);
    var przez_odejmowanie = mnozenie_przez_odejmowanie(a, b, deep);
    var przez_rkw = mnozenie_przez_rkw(a, b, deep);
    var bazowe = mnozenie_bazowe(a, b, deep);
    var przez_czynniki = mnozenie_przez_czynniki(a, b, deep);
    var przez_dzielenie = mnozenie_przez_dzielenie(a, b, deep);
    if (przez_dodawanie.entropia < entropia) entropia = przez_dodawanie.entropia;
    if (przez_odejmowanie.entropia < entropia) entropia = przez_odejmowanie.entropia;
    if (przez_rkw.entropia < entropia) entropia = przez_rkw.entropia;
    if (bazowe.entropia < entropia) entropia = bazowe.entropia;
    if (przez_czynniki.entropia < entropia) entropia = przez_czynniki.entropia;
    if (przez_dzielenie.entropia < entropia) entropia = przez_dzielenie.entropia;
    if (entropia == przez_dodawanie.entropia) opis = opis_dod(a, b, przez_dodawanie.ll, przez_dodawanie.pp);
    if (entropia == przez_odejmowanie.entropia) opis = opis_odej(a, b, przez_odejmowanie.ll, przez_odejmowanie.pp);
    if (entropia == przez_rkw.entropia) opis = opis_rkw(a, b, przez_rkw.tryb);
    if (entropia == bazowe.entropia) opis = opis_baz(a, b, bazowe.baza);
    if (entropia == przez_czynniki.entropia) opis = opis_czyn(a, b, przez_czynniki.czynnik);
    if (entropia == przez_dzielenie.entropia) opis = opis_dziel(a, b, przez_dzielenie.czynnik);
    return [entropia, opis];
}
function porownaj(a, b, deep, entropia, opis) {
    if (deep == undefined) deep = 0;
    var entropia = Infinity, opis;
    var przez_dodawanie = mnozenie_przez_dodawanie(a, b, deep);
    var przez_odejmowanie = mnozenie_przez_odejmowanie(a, b, deep);
    var przez_rkw = mnozenie_przez_rkw(a, b, deep);
    var bazowe = mnozenie_bazowe(a, b, deep);
    var przez_czynniki = mnozenie_przez_czynniki(a, b, deep);
    var przez_dzielenie = mnozenie_przez_dzielenie(a, b, deep);
    [a, b] = [b, a];
    var przez_dodawanie2 = mnozenie_przez_dodawanie(a, b, deep);
    var przez_odejmowanie2 = mnozenie_przez_odejmowanie(a, b, deep);
    var przez_rkw2 = mnozenie_przez_rkw(a, b, deep);
    var bazowe2 = mnozenie_bazowe(a, b, deep);
    var przez_czynniki2 = mnozenie_przez_czynniki(a, b, deep);
    var przez_dzielenie2 = mnozenie_przez_dzielenie(a, b, deep);
    przez_dodawanie2.opis = opis_dod(a, b, przez_dodawanie2.ll, przez_dodawanie2.pp);
    przez_odejmowanie2.opis = opis_odej(a, b, przez_odejmowanie2.ll, przez_odejmowanie2.pp);
    przez_rkw2.opis = opis_rkw(a, b, przez_rkw2.tryb);
    bazowe2.opis = opis_baz(a, b, bazowe2.baza);
    przez_czynniki2.opis = opis_czyn(a, b, przez_czynniki2.czynnik);
    przez_dzielenie2.opis = opis_dziel(a, b, przez_dzielenie2.czynnik);
    [a, b] = [b, a];
    przez_dodawanie.opis = opis_dod(a, b, przez_dodawanie.ll, przez_dodawanie.pp);
    przez_odejmowanie.opis = opis_odej(a, b, przez_odejmowanie.ll, przez_odejmowanie.pp);
    przez_rkw.opis = opis_rkw(a, b, przez_rkw.tryb);
    bazowe.opis = opis_baz(a, b, bazowe.baza);
    przez_czynniki.opis = opis_czyn(a, b, przez_czynniki.czynnik);
    przez_dzielenie.opis = opis_dziel(a, b, przez_dzielenie.czynnik);
    wyniki = [przez_dodawanie, przez_odejmowanie, przez_rkw, bazowe, przez_czynniki, przez_dzielenie, przez_dodawanie2, przez_odejmowanie2, przez_rkw2, bazowe2, przez_czynniki2, przez_dzielenie2];
    wyniki.sort(compare_entropia);
    console.table(wyniki);
}
//znajduje entropie mnozenia i najlepsza metode
function symuluj_mnozenie(a, b, deep) {
    var entropia = Infinity, opis;
    if (deep == undefined) deep = 0;
    ++deep;
    if (deep > MAX_DEEP) return { entropia, opis };
    if (a < 0) a *= -1;
    if (b < 0) b *= -1;
    [a, b] = uprosc(a, b);
    if (a < PREP_MAX && b < 10 && prep[a][b] != undefined) {
        entropia = prep[a][b].entropia;
        opis = prep[a][b].opis;
        return { entropia, opis };
    }
    if (b < PREP_MAX && a < 10 && prep[a][b] != undefined) {
        entropia = prep[b][a].entropia;
        opis = prep[b][a].opis;
        return { entropia, opis };
    }
    if (a < 10 || b < 10) return mnozenie_nx1(a, b);
    [entropia, opis] = pomnoz(a, b, deep, entropia, opis);
    if (a != b) [entropia, opis] = pomnoz(b, a, deep, entropia, opis);
    else {
        var s = symuluj_kwadrat(a);
        if (s.entropia <= entropia) {
            entropia = s.entropia;
            opis = s.opis;
        }
    }
    return { entropia, opis };
}
/* Znajduje entropie dzielenia.
   Dopóki dzielnik jest wielokrotnoscia 5 oplaca sie podwoic obie liczby.*/
function symuluj_dzielenie(a, b, deep) {
    var entropia = 0, wielb, stos;
    if (a < 0) a *= -1;
    if (b < 0) b *= -1;
    if (b == 0) return entropia;
    while (b % 5 == 0) {
        if (b % 10 == 0) {
            b /= 10;
            if (a % 10 == 0) a /= 10;
        }
        else {
            a *= 2;
            b *= 2;
        }
    }
    if (b == 1) return entropia;
    wielb = b;
    while (wielb <= a) wielb *= 10;
    while (a >= b) {
        wielb /= 10;
        stos = ~~(a / wielb);
        if (b < 10) entropia += entropia_dzielenia;
        else if (b < 100) entropia += entropia_dzielenia2;
        else entropia += entropia_dzielenia3;
        entropia += symuluj_mnozenie(stos, wielb - rzad_wielkosci(wielb) * pierwsza_cyfra(wielb), deep).entropia;
        entropia += symuluj_odejmowanie(a, stos * wielb);
        a -= stos * wielb;
    }
    return entropia;
}
function symuluj_szescian(a) {
    while (a % 10 == 0) a /= 10;
    if (a < 0) a *= -1;
    if (a < 10) return entropia_szecianu;
    if (a < 100) return log(100);
    return symuluj_kwadrat(a).entropia + symuluj_mnozenie(a * a, a, 1).entropia;//deep = 1 aby obliczalo sie szybciej
}
function symuluj_4_potege(a) {
    if (a < 0) a *= -1;
    return symuluj_kwadrat(a).entropia + symuluj_mnozenie(a * a, a * a).entropia;
}
function symuluj_potege(x, wykl) {
    if (wykl == 2) return symuluj_mnozenie(x, x).entropia;
    if (wykl == 3) return symuluj_szescian(x);
    if (wykl == 4) return symuluj_4_potege(x);
    if (wykl % 2 == 0) return symuluj_kwadrat(x).entropia + symuluj_potege(x * x, wykl / 2);
    return symuluj_potege(x, wykl - 1) + symuluj_mnozenie(Math.pow(x, wykl - 1), x).entropia;
}