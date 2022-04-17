var wynik = 0;
var opis_dzialania = "";
var timeouts = [];
var stoper_timeout, stoper_start, stoper_end;
var stats = {};
var czy_sprawdzane_statystyki = false;
var czy_odpowiedziano_poprawnie = true;
var czy_wpisuje_odwrotnie = 0;
var czy_sprawdzany_wynik = true;
var ostatnia_wyswietlona_liczba = 0;
var wyswietlone_liczby = [];
var MAX_SITO = 100000;
var czy_zlozona = new Array(MAX_SITO);
var liczby_pierwsze = [];

on_load();

function on_load() {
    add_events();
    wczytaj_wszystkie_ustawienia();
    wyswietl_ustawienia();
    sito();
}

function add_events() {
    document.getElementById("wlacz_statystyki").addEventListener("click", wlacz_statystyki);
    document.getElementById("wylacz_statystyki").addEventListener("click", wylacz_statystyki);
    document.getElementById("wyswietl_statystyki").addEventListener("click", wyswietl_statystyki);
    document.getElementById("ukryj_statystyki").addEventListener("click", ukryj_statystyki);
    document.getElementById("start").addEventListener("click", start);
    document.getElementById("tryb").addEventListener("change", wyswietl_ustawienia);
    window.addEventListener('keydown', pisanie_odpowiedzi);
    add_events_in_text_inputs();
}

function add_events_in_text_inputs() {
    var inputs = document.getElementsByTagName("INPUT");
    for (var i = 0; i < inputs.length; ++i) {
        var input = inputs[i];
        if (input.type == "text") {
            nie_pisz_na_stronie_gdy_jestes_w_polu_tekstowym(input);
            pisz_na_stronie_gdy_opusciles_pole_tekstowe(input);
        }
    }
}

function nie_pisz_na_stronie_gdy_jestes_w_polu_tekstowym(input) {
    input.addEventListener("focus", function (event) {
        window.removeEventListener("keydown", pisanie_odpowiedzi);
    });
}

function pisz_na_stronie_gdy_opusciles_pole_tekstowe(input) {
    input.addEventListener("blur", function (event) {
        window.addEventListener("keydown", pisanie_odpowiedzi);
    });
}

function wczytaj_wszystkie_ustawienia() {
    var ids = get_ids();
    for (var i = 0; i < ids.length; ++i)wczytaj_ustawienia(ids[i]);
}

function wczytaj_ustawienia(x) {
    var elem = document.getElementById(x);
    if (elem) elem.value = localStorage.getItem(x);
}

function get_ids() {
    var id_elements = get_id_elements();
    var ids = [];
    for (var i = 0; i < id_elements.length; ++i) {
        ids.push(id_elements[i].id);
    }
    return ids;
}

function get_id_elements() {
    return document.getElementById("ustawienia").querySelectorAll('[id]');
}

function wyswietl_ustawienia() {
    set_local_storage_all();
    ukryj_ustawienia();
    var t = document.getElementById("tryb").value;
    wyswietl_elementy(document.getElementsByClassName(t));
}

function set_local_storage_all() {
    var ids = get_ids();
    for (var i = 0; i < ids.length; ++i)set_local_storage(ids[i]);
}

function set_local_storage(x) {
    var elem = document.getElementById(x);
    if (elem) localStorage.setItem(x, elem.value);
}

function ukryj_ustawienia() {
    var classes = get_classes();
    for (var i = 0; i < classes.length; ++i)ukryj_elementy(document.getElementsByClassName(classes[i]));
}

function get_classes() {
    var class_elements = get_class_elements();
    var classes = [];
    for (var i = 0; i < class_elements.length; ++i) classes.push(class_elements[i].className);
    classes = classes.filter(onlyUnique);
    return classes;
}

function get_class_elements() {
    return document.getElementById("ustawienia").querySelectorAll('[class]');
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

function ukryj_elementy(tab) {
    for (var i = 0; i < tab.length; ++i)tab[i].style.display = "none";
}

function wyswietl_elementy(tab) {
    for (var i = 0; i < tab.length; ++i)tab[i].style.display = "table-row";
}

function pisanie_odpowiedzi(event) {
    if (czy_wpisuje_odwrotnie == 1) {
        odwroc_odpowiedz();
    }
    if (event.key == 'Backspace') {
        usun_ostatni_znak();
    }
    if (event.key.length == 1 && event.key >= '0' && event.key <= '9') pisz_cyfre(event);
    if (event.key == '.' || event.key == ',') pisz_przecinek(event);
    if (event.key == '-') pisz_minus(event);
    if (event.key == 'r') zmien_tryb_pisania_na_odwrotny();
    if (czy_wpisuje_odwrotnie == 1) {
        odwroc_odpowiedz();
    }
    if (event.key != 'Enter') jesli_odpowiedz_jest_poprawna();
}

function odwroc_odpowiedz() {
    var bylo = document.getElementById('odpowiedz').textContent;
    var jest = bylo.split("").reverse().join("");
    document.getElementById("odpowiedz").innerHTML = jest;
}

function usun_ostatni_znak() {
    var bylo = document.getElementById('odpowiedz').textContent;
    var jest = bylo.slice(0, -1);
    document.getElementById("odpowiedz").innerHTML = jest;
}

function pisz_cyfre(event) {
    document.getElementById("odpowiedz").innerHTML += event.key;
}

function pisz_przecinek(event) {
    document.getElementById("odpowiedz").innerHTML += '.';
}

function pisz_minus(event) {
    document.getElementById("odpowiedz").innerHTML += '-';
}

function zmien_tryb_pisania_na_odwrotny() {
    czy_wpisuje_odwrotnie = 1 - czy_wpisuje_odwrotnie;
}

function jesli_odpowiedz_jest_poprawna() {
    if (czy_odpowiedz_jest_poprawna() == true) {
        var czas_odpowiedzi = ile_sekund_trwala_odpowiedz();
        zatrzymaj_stoper();
        if (czy_sprawdzane_statystyki == true) {
            zapisz_poprawna_odpowiedz_do_statystyk(czas_odpowiedzi);
        }
        ustaw_kolor_strony("green");
        czy_odpowiedziano_poprawnie = true;
    }
}

function ustaw_kolor_strony(kolor) {
    document.body.style.color = kolor;
    if (document.getElementById("tryb").value == "dod_ode" && document.getElementById("dod_ode_tryb").value == "a+b-c") {
        var elem = document.getElementsByClassName("dzialanie");
        for (var i = 0; i < elem.length; ++i) {
            if (i % 2 == 0) {
                elem[i].style.color = "green";
            }
        }
    }
}

function czy_odpowiedz_jest_poprawna() {
    var odpowiedz = document.getElementById("odpowiedz").textContent - 0;
    var kategoria = document.getElementById("tryb").value;
    if (czy_sprawdzany_wynik == false) return false;
    if (kategoria == "fakt") return czy_odpowiedz_jest_poprawna_kategoria_faktoryzacja();
    else if (kategoria == "suma4kw") return czy_odpowiedz_jest_poprawna_kategoria_suma_4_kwadratow();
    else if (odpowiedz == wynik) return true;
    return false;
}

function czy_odpowiedz_jest_poprawna_kategoria_faktoryzacja() {
    var odpowiedz = document.getElementById("odpowiedz").textContent;
    var czynniki = odpowiedz.split(".");
    var iloczyn = 1;
    for (var i = 0; i < czynniki.length; ++i) {
        if (is_prime(czynniki[i]) == 0) return false;
        iloczyn *= czynniki[i];
    }
    if (iloczyn != wynik) return false;
    return true;
}

function czy_odpowiedz_jest_poprawna_kategoria_suma_4_kwadratow() {
    var odpowiedz = document.getElementById("odpowiedz").textContent;
    var kwadraty = odpowiedz.split(".");
    var suma = 0;
    if (kwadraty.length > 4) return false;
    for (var i = 0; i < kwadraty.length; ++i) {
        suma += kwadraty[i] * kwadraty[i];
    }
    if (suma != wynik) return false;
    return true;
}

function ile_sekund_trwala_odpowiedz() {
    stoper_end = new Date();
    return (stoper_end - stoper_start) / 1000;
}

function zatrzymaj_stoper() {
    clearTimeout(stoper_timeout);
}

function zapisz_poprawna_odpowiedz_do_statystyk(czas_odpowiedzi) {
    var w = {};
    w.czas = czas_odpowiedzi;
    w.opis = opis_dzialania;
    stats.dzialania.push(w);
}

function zapisz_bledna_odpowiedz_do_statystyk() {
    var w = {};
    w.czas = Infinity;
    w.opis = opis_dzialania;
    stats.dzialania.push(w);
}

function wyswietl_statystyki() {
    wyswietl_drugi_przycisk_zamiast_pierwszego('wyswietl_statystyki', 'ukryj_statystyki');
    document.getElementById('statystyki').style.display = 'table';
    if (!stats.dzialania || stats.dzialania.length == 0) return;
    oblicz_statystyki();
    document.getElementById('najlepszy_czas').textContent = stats.najl + ' s ';
    document.getElementById('najgorszy_czas').textContent = stats.najg + ' s ';
    document.getElementById('sredni_czas').textContent = stats.sr_czas + ' s ';
    document.getElementById('procent_poprawnych').textContent = stats.skutecznosc + ' %';
    document.getElementById('liczba_poprawnych').textContent = stats.rozwiazane_zadania;
    document.getElementById('liczba_wszystkich').textContent = stats.wszystkie_zadania;
}

function ukryj_statystyki() {
    wyswietl_drugi_przycisk_zamiast_pierwszego('ukryj_statystyki', 'wyswietl_statystyki');
    document.getElementById('statystyki').style.display = 'none';
}

function wyswietl_drugi_przycisk_zamiast_pierwszego(id1, id2) {
    document.getElementById(id1).style.display = 'none';
    document.getElementById(id2).style.display = 'table-cell';
}

function oblicz_statystyki() {
    stats.wszystkie_zadania = stats.dzialania.length;
    stats.najl = Infinity;
    stats.najg = 0;
    stats.rozwiazane_zadania = 0;
    stats.rozwiazane_czas = 0;
    for (var i = 0; i < stats.wszystkie_zadania; ++i) {
        var akt = stats.dzialania[i].czas;
        if (akt != Infinity) {
            if (akt < stats.najl) stats.najl = akt;
            if (akt > stats.najg) stats.najg = akt;
            ++stats.rozwiazane_zadania;
            stats.rozwiazane_czas += akt;
        }
    }
    if (stats.rozwiazane_zadania > 0) stats.sr_czas = stats.rozwiazane_czas / stats.rozwiazane_zadania;
    else stats.sr_czas = Infinity;
    stats.skutecznosc = (stats.rozwiazane_zadania / stats.wszystkie_zadania * 100);
    zaokraglij_statystyki();
}

function zaokraglij_statystyki() {
    var p = 4;
    stats.sr_czas = stats.sr_czas.toPrecision(p);
    stats.skutecznosc = stats.skutecznosc.toPrecision(p);
}

function wlacz_statystyki() {
    wyswietl_drugi_przycisk_zamiast_pierwszego('wlacz_statystyki', 'wylacz_statystyki');
    document.getElementById('ustawienia').addEventListener('mousedown', blokada_zmiany_ustawien);
    czy_sprawdzane_statystyki = true;
    init_stats();
}

function wylacz_statystyki() {
    wyswietl_drugi_przycisk_zamiast_pierwszego('wylacz_statystyki', 'wlacz_statystyki');
    document.getElementById('ustawienia').removeEventListener('mousedown', blokada_zmiany_ustawien);
    czy_sprawdzane_statystyki = false;
}

function init_stats() {
    stats = {};
    stats.dzialania = [];
}

function test_sredni_czas() {
    var prec = 6;
    var ile = 0, suma = 0, suma2 = 0;
    for (var i = 0; i < stats.dzialania.length; ++i) {
        var cz = stats.dzialania[i].czas;
        if (cz == Infinity) continue;
        ++ile;
        suma += cz;
        suma2 += cz * cz;
    }
    var sr = suma / ile;
    var o = Math.sqrt(((suma2 / ile) - sr * sr) / (ile - 1));
    console.log("t = " + sr.toPrecision(prec) + " +- " + o.toPrecision(prec));
}

function blokada_zmiany_ustawien() {
    window.alert('Nie mozna zmieniac ustawien gdy wlaczone sa statystyki');
    event.preventDefault();
}

function start() {
    if (czy_sprawdzane_statystyki == true) {
        if (czy_odpowiedziano_poprawnie == false) {
            zapisz_bledna_odpowiedz_do_statystyk();
        }
    }
    wyczysc_timeouty();
    wyczysc_odpowiedz();
    ustaw_kolor_strony("red");
    set_local_storage_all();
    ukryj_dzialanie();
    generuj_i_wyswietl_dzialanie();
    wlacz_stoper();
    czy_sprawdzany_wynik = true;
    czy_odpowiedziano_poprawnie = false;

}

function wyczysc_timeouty() {
    clearTimeout(stoper_timeout);
    for (var i = 0; i < timeouts.length; ++i) {
        clearTimeout(timeouts[i]);
    }
    timeouts = [];
}

function wyczysc_odpowiedz() {
    document.getElementById('odpowiedz').textContent = '';
}

function ukryj_dzialanie() {
    ukryj_elementy(document.getElementsByClassName("dzialanie"));
}

function wlacz_stoper() {
    stoper_start = new Date();
    wyswietlaj_stoper(document.getElementById('stoper'), stoper_start);
}

function wyswietlaj_stoper(obj, i, min, s, ms, czas) {
    czas = new Date() - i + 5;// dodaje 5 aby zaokraglic setne sekundy
    min = (~~(czas / 60000));
    s = (~~(czas / 1000)) % 60;
    ms = czas % 1000;
    obj.innerHTML = '';
    if (min < 10) obj.innerHTML += '0';
    obj.innerHTML += min;
    obj.innerHTML += ':';
    if (s < 10) obj.innerHTML += '0';
    obj.innerHTML += s;
    obj.innerHTML += ',';
    if (ms < 95) obj.innerHTML += '0';
    obj.innerHTML += ~~(ms / 10);
    stoper_timeout = setTimeout(function () { wyswietlaj_stoper(obj, i) }, 10);
}

function generuj_i_wyswietl_dzialanie() {
    var kategoria = document.getElementById("tryb").value;
    switch (kategoria) {
        case "dod":
            generuj_flash_anzan();
            break;
        case "dod_ode":
            generuj_dodawanie_odejmowanie();
            break;
        case "multi":
            generuj_mnozenie();
            break;
        case "multi3":
            generuj_mnozenie_3_liczb();
            break;
        case "dziel":
            generuj_dzielenie();
            break;
        case "pot":
            generuj_potegowanie();
            break;
        case "pierw":
            generuj_pierwiastkowanie();
            break;
        case "logs":
            generuj_logarytmowanie();
            break;
        case "fakt":
            generuj_faktoryzacje();
            break;
        case "tryg":
            generuj_trygonometrie();
            break;
        case "kal":
            generuj_kalendarz();
            break;
        case "ile_sek":
            generuj_ile_sekund_minelo();
            break;
        case "suma4kw":
            generuj_sume_4_kwadratow();
            break;
        case "kwad_szes":
            generuj_kwadraty_szesciany();
            break;
        case "test":
            kategoria_testowa();
    }
}

function kategoria_testowa() {
    if (czy_sprawdzane_statystyki == true) test_sredni_czas();
    var a = rand(10, 99);
    var b = rand(0, 9);
    if (a < b) [a, b] = [b, a];
    wynik = a - b;
    opis_dzialania = a + "-" + b;
    wyswietl_dzialanie([a, b]);
}

function generuj_flash_anzan() {
    var czas_wyswietlania = document.getElementById("dod_czas_znikania").value - 0;
    var ile_liczb = document.getElementById("liczba_liczb").value - 0;
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    var laczny_czas_wyswietlania = czas_wyswietlania * (ile_liczb + 1);
    wynik = 0;
    czy_sprawdzany_wynik = false;
    wyswietlaj_liczby(czas_wyswietlania, ile_liczb, ile_cyfr);
    po_wyswietleniu_liczb(laczny_czas_wyswietlania);
}

function wyswietlaj_liczby(czas_wyswietlania, ile_liczb, ile_cyfr) {
    wyswietlone_liczby = [];
    for (var i = 1; i <= ile_liczb; ++i) {
        var s = setTimeout(function () {
            requestAnimationFrame(function () {
                var x = wylosuj_inna_liczbe(ile_cyfr);
                ostatnia_wyswietlona_liczba = x;
                wyswietl_dzialanie([x]);
                wyswietlone_liczby.push(x);
                zmien_kolor_wyswietlanej_liczby();
                wynik += x;
            });
        }, czas_wyswietlania * i);
        timeouts.push(s);
    }
}

function po_wyswietleniu_liczb(czas) {
    var x = setTimeout(function () {
        requestAnimationFrame(function () {
            ukryj_dzialanie();
        });
        czy_sprawdzany_wynik = true;
        opis_dzialania = wyswietlone_liczby.join("+");
    }, czas);
    timeouts.push(x);
}

function wyswietl_dzialanie(wiersze) {
    var ile_wierszy = wiersze.length;
    var elem = document.getElementsByClassName("dzialanie");
    for (var i = 0; i < elem.length; ++i) {
        if (i < ile_wierszy) elem[i].textContent = wiersze[i];
        else elem[i].textContent = "";
        elem[i].style.display = "table-cell";
    }
    wyswietl_elementy(elem);
}

function zmien_kolor_wyswietlanej_liczby() {
    var l1 = document.getElementById("liczba1");
    if (l1.style.color == "red") l1.style.color = "green";
    else l1.style.color = "red";
}

function wylosuj_inna_liczbe(ile_cyfr) {
    var x = losuj(ile_cyfr);
    while (x == ostatnia_wyswietlona_liczba) x = losuj(ile_cyfr);
    return x;
}

function losuj(liczba_cyfr) {
    var w = rand(1, 9);
    for (var i = 1; i < liczba_cyfr; ++i) {
        w *= 10;
        w += rand(0, 9);
    }
    return w;
}

function rand(a, b) {
    return Math.floor((Math.random() * (b - a + 1))) + a;
}

function generuj_dodawanie_odejmowanie() {
    var tryb = document.getElementById("dod_ode_tryb").value;
    var ile_liczb = document.getElementById("liczba_liczb").value - 0;
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    switch (tryb) {
        case "a+b+c":
            generuj_dodawanie(ile_liczb, ile_cyfr);
            break;
        case "a-b-c":
            generuj_odejmowanie(ile_liczb, ile_cyfr);
            break;
        case "a+b-c":
            generuj_dodawanie_odejmowanie_naprzemian(ile_liczb, ile_cyfr);
            break;
    }
    var znikanie = document.getElementById("czy_znika").value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(ile_liczb * ile_cyfr);
}

function generuj_dodawanie(ile_liczb, ile_cyfr) {
    var dzialanie = [], los;
    wynik = 0;
    for (var i = 0; i < ile_liczb; ++i) {
        los = losuj(ile_cyfr);
        dzialanie.push(los);
        wynik += los;
    }
    //TEST
    /*if (ile_liczb == 2) {
        while (wynik < 10) {
            dzialanie[0] = losuj(ile_cyfr);
            dzialanie[1] = losuj(ile_cyfr);
            wynik = dzialanie[0] + dzialanie[1];
        }
    }*/
    //

    wyswietl_dzialanie(dzialanie);
    opis_dzialania = dzialanie.join("+");
}

function generuj_odejmowanie(ile_liczb, ile_cyfr) {
    var los = losuj(ile_cyfr);
    var dzialanie = [los];
    wynik = los;
    for (var i = 1; i < ile_liczb; ++i) {
        los = losuj(ile_cyfr);
        dzialanie.push(los);
        wynik -= los;
    }
    if (ile_liczb == 2) {
        if (dzialanie[0] < dzialanie[1]) {
            [dzialanie[0], dzialanie[1]] = [dzialanie[1], dzialanie[0]];
            wynik *= -1;
        }
    }
    //TEST
    /*dzialanie[0] = 10;
    dzialanie[1] = rand(1, 9);
    wynik = 10 - dzialanie[1];*/
    //
    wyswietl_dzialanie(dzialanie);
    opis_dzialania = dzialanie.join("-");
}

function generuj_dodawanie_odejmowanie_naprzemian(ile_liczb, ile_cyfr) {
    var los = losuj(ile_cyfr);
    var dzialanie = [los];
    wynik = los;
    opis_dzialania = los;
    for (var i = 1; i < ile_liczb; ++i) {
        los = losuj(ile_cyfr);
        dzialanie.push(los);
        if (i % 2 == 1) {
            wynik -= los;
            opis_dzialania += "-" + los;
        }
        else {
            wynik += los;
            opis_dzialania += "+" + los;
        }
    }
    wyswietl_dzialanie(dzialanie);
}


function generuj_mnozenie() {
    var typ = document.getElementById("multi_typ").value;
    var dlugosc1, dlugosc2;
    [dlugosc1, dlugosc2] = dlugosci_liczb(typ);
    var x = losuj_nietrywialne(dlugosc1);
    var y = losuj_nietrywialne(dlugosc2);
    //TEST
    /*if (dlugosc1 == 1 && dlugosc2 == 1) {
        while (x * y < 10) {
            x = losuj_nietrywialne(dlugosc1);
            y = losuj_nietrywialne(dlugosc2);
        }
    }*/

    wynik = x * y;
    wyswietl_dzialanie([x, y]);
    var znikanie = document.getElementById("czy_znika").value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(dlugosc1 + dlugosc2);
    opis_dzialania = x + '*' + y;
}

function dlugosci_liczb(typ) {
    var dlug1, dlug2, dlug3;
    if (typ == "10/5") {
        dlug1 = 10;
        dlug2 = 5;
    }
    else {
        dlug1 = typ[0] - 0;
        if (typ[2] != 'n') dlug2 = typ[2] - 0;
        if (typ.length == 5) dlug3 = typ[4] - 0;
    }
    return [dlug1, dlug2, dlug3];
}

function losuj_nietrywialne(liczba_cyfr) {
    var x = losuj(liczba_cyfr);
    while (x % 10 == 0 || x == 1) x = losuj(liczba_cyfr);
    return x;
}

function oblicz_czas_i_ukryj_dzialanie(cyfry_razem) {
    var CZAS_WYSWIETLANIA = 50;
    var cz = CZAS_WYSWIETLANIA * cyfry_razem;
    if (cyfry_razem > 4) cz += (cyfry_razem - 4) * CZAS_WYSWIETLANIA * 3;
    var xx = setTimeout(function () {
        ukryj_dzialanie();
    }, cz);
    timeouts.push(xx);
}

function generuj_mnozenie_3_liczb() {
    var typ = document.getElementById("multi3_typ").value;
    var dlugosc1, dlugosc2, dlugosc3;
    [dlugosc1, dlugosc2, dlugosc3] = dlugosci_liczb(typ);
    var x = losuj_nietrywialne(dlugosc1);
    var y = losuj_nietrywialne(dlugosc2);
    var z = losuj_nietrywialne(dlugosc3);
    wynik = x * y * z;
    wyswietl_dzialanie([x, y, z]);
    var znikanie = document.getElementById("czy_znika").value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(dlugosc1 + dlugosc2 + dlugosc3);
    opis_dzialania = x + '*' + y + '*' + z;
}

function generuj_dzielenie() {
    var typ = document.getElementById("dziel_typ").value;
    var tryb = document.getElementById("dziel_tryb").value;
    var prec = document.getElementById("dokladnosc").value - 0;
    var dlugosc1, dlugosc2, x, y;
    [dlugosc1, dlugosc2] = dlugosci_liczb(typ);
    [x, y] = generuj_dzielenie_dzialanie(tryb, dlugosc1, dlugosc2);
    wynik = generuj_dzielenie_wynik(tryb, prec, x, y);
    wyswietl_dzialanie([x, y]);
    var znikanie = document.getElementById('czy_znika').value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(dlugosc1 + dlugosc2);
    opis_dzialania = x + "/" + y;
}

function generuj_dzielenie_dzialanie(tryb, dlugosc1, dlugosc2) {
    var a, b;
    switch (tryb) {
        case "dol":
        case "reszta":
            [a, b] = losuj_dzielenie(dlugosc1, dlugosc2);
            break;
        case "calk":
            [a, b] = losuj_dzielenie_calkowite(dlugosc1, dlugosc2);
            break;
        case "okrdok":
            [a, b] = losuj_dzielenie_krotkie(dlugosc1, dlugosc2);
            break;
        case "okrdokw":
            [a, b] = losuj_dzielenie_dlugie(dlugosc1, dlugosc2);
            break;
        case "mniejsze":
            [a, b] = losuj_dzielenie_krotkie_calkowite(dlugosc1, dlugosc2);
            break;
        case "wieksze":
            [a, b] = losuj_dzielenie_dlugie_calkowite(dlugosc1, dlugosc2);
            break;
    }
    return [a, b];
}

function generuj_dzielenie_wynik(tryb, prec, x, y) {
    var w;
    if (tryb == "reszta") w = x % y;
    else w = x / y;
    switch (tryb) {
        case "dol":
        case "mniejsze":
        case "wieksze":
            w = ~~(w);
            break;
        case "okrdok":
        case "okrdokw":
            w = w.toPrecision(prec);
            if (prec < Math.ceil(Math.log10(x / y))) {
                w = zamien_postac_naukowa_na_zwykla(w);
            }
            break;
    }
    return w;
}

function losuj_dzielenie(dlugosc1, dlugosc2) {
    var a = losuj_nietrywialne(dlugosc1);
    var b = losuj_nietrywialne(dlugosc2);
    //TEST
    /*while (Math.floor(a / b) < 2) {
         a = losuj_nietrywialne(dlugosc1);
         b = losuj_nietrywialne(dlugosc2);
    }*/
    //
    return [a, b];
}

function losuj_dzielenie_calkowite(dlugosc1, dlugosc2) {
    var a, b;
    [a, b] = losuj_dzielenie(dlugosc1, dlugosc2);
    a = (~~(a / b)) * b;
    while (a == 0) {
        [a, b] = losuj_dzielenie(dlugosc1, dlugosc2);
        a = (~~(a / b)) * b;
    }
    return [a, b];
}

function losuj_dzielenie_krotkie(dlugosc1, dlugosc2) {
    var a, b;
    [a, b] = losuj_dzielenie(dlugosc1, dlugosc2);
    while (a.toString() >= b.toString()) {
        [a, b] = losuj_dzielenie(dlugosc1, dlugosc2);
    }
    return [a, b];
}

function losuj_dzielenie_dlugie(dlugosc1, dlugosc2) {
    var a, b;
    [a, b] = losuj_dzielenie(dlugosc1, dlugosc2);
    while (a.toString() < b.toString()) {
        [a, b] = losuj_dzielenie(dlugosc1, dlugosc2);
    }
    return [a, b];
}

function losuj_dzielenie_krotkie_calkowite(dlugosc1, dlugosc2) {
    var a, b;
    [a, b] = losuj_dzielenie_calkowite(dlugosc1, dlugosc2);
    while (a.toString() >= b.toString()) {
        [a, b] = losuj_dzielenie_calkowite(dlugosc1, dlugosc2);
    }
    return [a, b];
}

function losuj_dzielenie_dlugie_calkowite(dlugosc1, dlugosc2) {
    var a, b;
    [a, b] = losuj_dzielenie_calkowite(dlugosc1, dlugosc2);
    while (a.toString() < b.toString()) {
        [a, b] = losuj_dzielenie_calkowite(dlugosc1, dlugosc2);
    }
    return [a, b];
}

function zamien_postac_naukowa_na_zwykla(x) {
    x += '#';
    var y = "";
    for (var i = 0; i < x.length; ++i) {
        if (x[i] == '.') continue;
        if (x[i] == 'e') break;
        y += x[i];
    }
    return y;
}

function generuj_potegowanie() {
    var dl_podst, podstawa, wykladnik;
    var typ = document.getElementById("pot_typ").value;
    [dl_podst, wykladnik] = dlugosci_liczb(typ);
    if (dl_podst > 1) podstawa = losuj_nietrywialne(dl_podst);
    else podstawa = losuj(dl_podst);
    if (!wykladnik) wykladnik = losuj_wykladnik(podstawa);
    wynik = Math.pow(podstawa, wykladnik);
    //TEST
    while (wynik < 100) {
        if (dl_podst > 1) podstawa = losuj_nietrywialne(dl_podst);
        else podstawa = losuj(dl_podst);
        if (!wykladnik) wykladnik = losuj_wykladnik(podstawa);
        wynik = Math.pow(podstawa, wykladnik);
    }
    //
    wyswietl_dzialanie([podstawa + '^' + wykladnik]);
    var znikanie = document.getElementById('czy_znika').value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(dl_podst);
    opis_dzialania = podstawa + "^" + wykladnik;
}

function losuj_wykladnik(podstawa) {
    var maks_wykl = [2, 2, 20, 12, 10, 8, 7, 7, 6, 6];
    return rand(2, maks_wykl[podstawa]);
}

function generuj_pierwiastkowanie() {
    var stopien = document.getElementById("pierw_stopien").value - 0;
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    var dokl = document.getElementById("dokladnosc").value - 0;
    var znikanie = document.getElementById("czy_znika").value;
    var calk = document.getElementById("pierw_czy_calkowite").value;
    var l = document.getElementById("liczba1");
    var x = losuj(ile_cyfr);
    if (calk == 'nie') [x, wynik] = generuj_pierwiastkowanie_niecalkowite(x, stopien, dokl, ile_cyfr);
    else[x, wynik] = generuj_pierwiastkowanie_calkowite(x, stopien);
    wyswietl_pierwiastek(x, stopien);
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(ile_cyfr);
    opis_dzialania = "Pierwiastek stopnia " + stopien + " z " + x;
}

function generuj_pierwiastkowanie_niecalkowite(x, stopien, dokl, ile_cyfr) {
    var wyn = Math.pow(x, 1 / stopien).toPrecision(dokl);
    if (dokl < Math.floor(ile_cyfr / 2)) {
        wyn = zamien_postac_naukowa_na_zwykla(wyn);
    }
    return [x, wyn];
}

function generuj_pierwiastkowanie_calkowite(x, stopien) {
    var rw = rzad_wielkosci(x);
    var minx = Math.ceil(Math.pow(rw, 1 / stopien));
    var maxx = Math.floor(Math.pow(rw * 10 - 1, 1 / stopien));
    var wyn = rand(minx, maxx);
    x = Math.pow(wyn, stopien);
    return [x, wyn];
}

function wyswietl_pierwiastek(x, stopien) {
    var l = document.getElementById("liczba1");
    if (stopien > 2) l.innerHTML = '<sup><font size="-1">' + stopien + '</font></sup>' + "&#8730;" + x;
    else l.innerHTML = "&#8730;" + x;
    l.style.display = 'table-cell';
}

function rzad_wielkosci(x) {
    var wyn = 1;
    while (wyn * 10 <= x) wyn *= 10;
    return wyn;
}

function generuj_logarytmowanie() {
    var typ = document.getElementById("logs_typ").value;
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    var ile_cyfr2 = document.getElementById("liczba_cyfr2").value - 0;
    var dokl = document.getElementById("dokladnosc").value - 0;
    var znik = document.getElementById("czy_znika").value;
    var x = losuj(ile_cyfr);
    var x2 = losuj(ile_cyfr2);
    if (typ == 'log') {
        [x, wynik] = generuj_logarytm_zwykly(x, dokl);
    }
    else if (typ == '10^x') {
        [x, wynik] = generuj_logarytm_odwrocony(x, dokl, ile_cyfr);
    }
    else {
        [x, wynik] = generuj_a_do_potegi_b(x, x2, dokl, ile_cyfr2);
    }
    opis_dzialania = x;
    wyswietl_dzialanie([x]);
    if (znik == 'tak') oblicz_czas_i_ukryj_dzialanie(ile_cyfr + 2);
}

function generuj_logarytm_zwykly(x, dokl) {
    wynik = Math.log10(x).toPrecision(dokl);
    var a = "log " + x;
    return [a, wynik];
}

function generuj_logarytm_odwrocony(x, dokl, ile_cyfr) {
    wynik = Math.pow(10, x / Math.pow(10, ile_cyfr)).toPrecision(dokl);
    var a = "10^0." + x;
    return [a, wynik];
}

function generuj_a_do_potegi_b(x, x2, dokl, ile_cyfr) {
    wynik = Math.pow(x, x2 / Math.pow(10, ile_cyfr)).toPrecision(dokl);
    var a = x + '^0.' + x2;
    return [a, wynik];
}

function generuj_trygonometrie() {
    var typ = document.getElementById("tryg_typ").value;
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    var dokl = document.getElementById("dokladnosc").value - 0;
    var x = (Math.random() * 90).toPrecision(ile_cyfr) - 0;
    var k = Math.PI / 180;
    if (typ == 'sin') wynik = Math.sin(x * k).toPrecision(dokl);
    else if (typ == 'cos') wynik = Math.cos(x * k).toPrecision(dokl);
    else if (typ == 'tan') wynik = Math.tan(x * k).toPrecision(dokl);
    var l = document.getElementById("liczba1");
    l.innerHTML = typ + ' ' + x + "&#xB0";
    l.style.display = 'table-cell';
    opis_dzialania = typ + " " + x;
    var znikanie = document.getElementById('czy_znika').value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(ile_cyfr + 1);
}

function generuj_kalendarz() {
    var tryb = document.getElementById("kal_tryb").value;
    if (tryb == "kod_roku") {
        generuj_kod_roku();
    }
    else if (tryb == "dzien_tygodnia") {
        generuj_obliczanie_dnia_tygodnia();
    }
}

function generuj_kod_roku() {
    var rok = rand(0, 99);
    wyswietl_dzialanie([rok]);
    var znikanie = document.getElementById('czy_znika').value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(2);
    wynik = kod_roku(rok);
    opis_dzialania = "kod roku " + rok;
}

function generuj_obliczanie_dnia_tygodnia() {
    var rok, mies, dzien;
    [rok, mies, dzien] = losuj_date();
    var data = rok + '-' + mies + '-' + dzien;
    wyswietl_dzialanie([data]);
    var znikanie = document.getElementById('czy_znika').value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(10);
    wynik = oblicz_dzien_tygodnia(rok, mies, dzien);
    opis_dzialania = "dzien tygodnia " + data;
}

function losuj_date() {
    var iledni = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    var rok, mies, dzien, przest;
    rok = rand(1600, 2100);
    przest = czy_przestepny(rok);
    if (przest == true) iledni[2] = 29;
    mies = rand(1, 12);
    dzien = rand(1, iledni[mies]);
    return [rok, mies, dzien];
}

function oblicz_dzien_tygodnia(rok, mies, dzien) {
    var kodWieku = kod_wieku(rok);
    var kodRoku = kod_roku(rok % 100);
    var kody_mies = [0, 6, 2, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    var kodMiesiaca = kody_mies[mies];
    var przest = czy_przestepny(rok);
    if (mies <= 2 && przest == 1) kodMiesiaca--;
    return (kodWieku + kodRoku + kodMiesiaca + dzien) % 7;
}

function kod_roku(rok) {
    return (rok + (~~(rok / 4))) % 7;
}

function czy_przestepny(rok) {
    var przest = false;
    if (rok % 100 == 0) {
        if (rok % 400 == 0) przest = true;
    }
    else if (rok % 4 == 0) przest = true;
    return przest;
}

function kod_wieku(rok) {
    var wiek = (~~(rok / 100)) % 4;
    if (wiek == 0) return 0;
    if (wiek == 1) return 5;
    if (wiek == 2) return 3;
    return 1;
}

function generuj_ile_sekund_minelo() {
    var trudnosc = document.getElementById("ile_sek_stopien_trudnosci").value - 0;
    var poc = {}, kon = {};
    [poc.rok, poc.miesiac, poc.dzien] = losuj_date();
    [poc.godzina, poc.minuta, poc.sekunda] = losuj_godzine();
    var js_date = new Date(poc.rok, poc.miesiac - 1, poc.dzien, poc.godzina, poc.minuta, poc.sekunda);
    var LEVEL_FACTOR = 5;
    var MIN_LV1_TIME = 12000;
    var min_t = MIN_LV1_TIME * Math.pow(LEVEL_FACTOR, trudnosc - 1);
    var max_t = min_t * LEVEL_FACTOR;
    var t = rand(min_t, max_t);
    js_date.add_time(t);
    kon.rok = js_date.getFullYear();
    kon.miesiac = js_date.getMonth() + 1;
    kon.dzien = js_date.getDate();
    kon.godzina = js_date.getHours();
    kon.minuta = js_date.getMinutes();
    kon.sekunda = js_date.getSeconds();
    wynik = licz_sekundy(poc, kon);
    poc = dodaj_zera_wiodace(poc);
    kon = dodaj_zera_wiodace(kon);
    var data_poc = poc.rok + '-' + poc.miesiac + '-' + poc.dzien + ' ' + poc.godzina + ':' + poc.minuta + ':' + poc.sekunda;
    var data_kon = kon.rok + '-' + kon.miesiac + '-' + kon.dzien + ' ' + kon.godzina + ':' + kon.minuta + ':' + kon.sekunda;
    wyswietl_dzialanie([data_poc, data_kon]);
    opis_dzialania = "ile sekund minelo od " + data_poc + " do " + data_kon;
    var znikanie = document.getElementById('czy_znika').value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(15);
}


Date.prototype.add_time = function (t) {
    this.setTime(this.getTime() + t);
    return this;
}


function licz_sekundy(poc, kon) {
    var dni = roznica_dni(poc, kon);
    var godziny = dni * 24 + kon.godzina - poc.godzina;
    var minuty = godziny * 60 + kon.minuta - poc.minuta;
    var sekundy = minuty * 60 + kon.sekunda - poc.sekunda;
    return sekundy;
}

function dodaj_zera_wiodace(data) {
    if (data.miesiac < 10) data.miesiac = "0" + data.miesiac;
    if (data.dzien < 10) data.dzien = "0" + data.dzien;
    if (data.godzina < 10) data.godzina = "0" + data.godzina;
    if (data.minuta < 10) data.minuta = "0" + data.minuta;
    if (data.sekunda < 10) data.sekunda = "0" + data.sekunda;
    return data;
}

function losuj_godzine() {
    var godzina = rand(0, 23);
    var minuta = rand(0, 59);
    var sekunda = rand(0, 59);
    return [godzina, minuta, sekunda];
}

function roznica_dni(poc, kon) {
    var pref = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var lata = kon.rok - poc.rok;
    var dni = pref[kon.miesiac - 1] - pref[poc.miesiac - 1] + kon.dzien - poc.dzien;
    [poc.przest, kon.przest] = [licz_dni_przestepne(poc), licz_dni_przestepne(kon)];
    var dni_przestepne = kon.przest - poc.przest;
    return lata * 365 + dni + dni_przestepne;
}

function licz_dni_przestepne(d) {
    var data = Object.assign({}, d);
    if (czy_przestepny(data.rok) == true) {
        if (data.miesiac <= 2) {
            --data.rok;
        }
    }
    return (~~(data.rok / 4)) - (~~(data.rok / 100)) + (~~(data.rok / 400));
}

function generuj_faktoryzacje() {
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    var trudnosc = document.getElementById("fakt_stopien_trudnosci").value - 0;
    var tab = new Array(11);
    for (var i = 0; i < 10; ++i) {
        var x = losuj(ile_cyfr);
        var tr = trudnosc_faktoryzacji(x);
        while (trudnosc_faktoryzacji(x) == -1 || is_prime(x) == 1) {
            x = losuj(ile_cyfr);
            tr = trudnosc_faktoryzacji(x);
        }
        tab[i] = {};
        tab[i].x = x;
        tab[i].tr = tr;
    }
    tab.sort(compare_tr);
    x = tab[trudnosc].x;
    wyswietl_dzialanie([x]);
    var znikanie = document.getElementById('czy_znika').value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(ile_cyfr);
    opis_dzialania = "factor " + x;
    wynik = x;// ustawienie wyniku na x jest potrzebne do porownania w funkcji czy_odpowiedz_jest_poprawna_kategoria_faktoryzacja()
}

function trudnosc_faktoryzacji(x) {
    if (x == 1) return -1;
    var tr = 0;
    for (var i = 0; i < 12; ++i) {
        while (x % liczby_pierwsze[i] == 0) {
            x /= liczby_pierwsze[i];
            tr = i;
        }
    }
    if (x == 1) return tr;
    if (x < 1000 && is_prime(x) == 1) return tr;
    var f = algorytm_fermata(x, 30);
    if (x < 1000000 && f > 0) return 12 + f;
    return -1;
}
function sito() {
    czy_zlozona[1] = 1;
    for (var i = 2; i < MAX_SITO; ++i) {
        if (czy_zlozona[i] == 1) continue;
        czy_zlozona[i] = 0;
        liczby_pierwsze.push(i);
        for (var j = i + i; j < MAX_SITO; j += i) {
            czy_zlozona[j] = 1;
        }
    }
}

function is_prime(x) {
    if (x < MAX_SITO) return 1 - czy_zlozona[x];
    var n = liczby_pierwsze.length;
    for (var i = 0; i < n; ++i) {
        var l = liczby_pierwsze[i];
        if (l * l > x) break;
        if (x % l == 0) return 0;
    }
    return 1;
}

function algorytm_fermata(x, n) {
    var sq = ~~(Math.sqrt(x)) + 1;
    var akt = sq * sq - x;
    var delta = 2 * sq + 1;
    for (var i = 0; i < n; ++i) {
        sq = ~~(Math.sqrt(akt));
        if (sq * sq == akt) return i + 1;
        akt += delta;
        delta += 2;
    }
    return -1;
}

function generuj_sume_4_kwadratow() {
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    var x = losuj(ile_cyfr);
    wyswietl_dzialanie([x]);
    wynik = x;// potrzebne do funkcji czy_odpowiedz_jest_poprawna_kategoria_suma_4_kwadratow()
    var znikanie = document.getElementById("czy_znika").value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(ile_cyfr);
    opis_dzialania = x + " jako suma 4 kwadratow";
}

function generuj_kwadraty_szesciany() {
    var ile_cyfr = document.getElementById("liczba_cyfr").value - 0;
    var tryb = document.getElementById("kwad_szes_tryb").value;
    var x = losuj(ile_cyfr);
    var pierwiastek = ~~(Math.sqrt(x));
    var pierwiastek3 = ~~(Math.cbrt(x));
    wyswietl_dzialanie([x]);
    switch (tryb) {
        case "nast_kwad":
            wynik = (pierwiastek + 1) * (pierwiastek + 1);
            opis_dzialania = "nastepny kwadrat od " + x;
            break;
        case "nast_szes":
            wynik = Math.pow((pierwiastek3 + 1), 3);
            opis_dzialania = "nastepny szescian od " + x;
            break;
        case "poprz_kwad":
            wynik = pierwiastek * pierwiastek;
            opis_dzialania = "poprzedni kwadrat od " + x;
            break;
        case "poprz_szes":
            wynik = Math.pow(pierwiastek3, 3);
            opis_dzialania = "poprzedni szescian od " + x;
            break;
    }
    var znikanie = document.getElementById("czy_znika").value;
    if (znikanie == 'tak') oblicz_czas_i_ukryj_dzialanie(ile_cyfr);
}

function compare_tr(a, b) {
    return a.tr - b.tr;
}
