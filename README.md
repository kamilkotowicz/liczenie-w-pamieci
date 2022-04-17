# liczenie-w-pamieci


main.js
---------------------------------------------------

Aplikacja służąca do trenowania obliczeń w pamięci.
Wybieramy odpowiednią kategorię i wciskamy przycisk start. Pojawia nam się działanie i włącza się stoper. Wpisujemy odpowiedź z klawiatury (pojawia się na stronie pod działaniem). Jeżeli odpowiedź jest poprawna to stoper zatrzymuje się, a strona zmienia kolor na zielony.
Program posiada też funkcję zapisywania osiągnietych czasów i wyświetlania statystyk.

Wyjaśnienia do niektórych kategorii:

-flash anzan
Liczby pojawiają się pojedynczo. Należy podać sumę wszystkich wyświetlonych liczb.

-dodawanie i odejmowanie -> naprzemian dodawanie z odejmowaniem
Liczby zazanaczone na czerwono są ze znakiem minus (odejmujemy je)

-potegowanie -> 1^n
Potęgowanie w zakresie do od 1 do 1048576 (2^20)

-faktoryzacja
Czynniki oddzielamy kropką. Mogą być w dowolnej kolejności. Każdy czynnik wpisujemy tyle razy ile wynosi jego wykładnik w rozkładzie na czyniki.

-kalendarz -> dzien tygodnia
Odpowiedzią jest numer dnia tygodnia wyświetlonej daty (niedziela - 0, poniedzialek - 1, wtorek - 2, ..., sobota - 6)

-kalendarz -> kod roku
Wynikiem jest liczba od 0 do 6 oznaczająca kod roku w obliczaniu dnia tygodnia.
Można ją obliczyć na przykład ze wzoru ((rok mod 100) + (floor((rok mod 100) / 4))) mod 7

-suma 4 kwadratow
Należy podać od 1 do 4 liczb oddzielonych kropka, których suma kwadratów jest równa wyświetlonej liczbie.


symulator.js
---------------------------------------------------

Program mierzy ile pracy należy włożyć, aby obliczyć działanie w pamięci różnymi metodami i porównuje, która jest teorytycznie najłatwiejsza.
Prosty model oparty na entropii i prawie Hicka.

Zalecany sposób użycia (dla mnozenia):
W konsoli dla programistów wywołujemy funkcje porównaj.
Wyświetla się tabela z porównaniem metod.

Inny sposób użycia przez funkcje: symuluj_dodawanie, symuluj_odejmowanie, symuluj_mnozenie, symuluj_dzielenie. 



