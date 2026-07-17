🚀 NutriTECH — Platformă digitală de educație nutrițională și alfabetizare alimentară

NutriTECH este o aplicație web completă, concepută ca un ghid educațional interactiv destinat tinerilor. Proiectul își propune să sprijine combaterea dezinformării din domeniul alimentar prin predarea practică a principiilor nutriției științifice. În loc să fie un simplu instrument de calcul, NutriTECH funcționează ca un laborator digital unde utilizatorii înțeleg mecanismele din spatele metabolismului, învață să își structureze corect mesele și își validează cunoștințele prin module interactive.

🧩 Problema identificată

În era rețelelor sociale, tinerii se confruntă cu un fenomen îngrijorător de analfabetism nutrițional și dezinformare:


Promovarea dietelor extreme și lipsa unei înțelegeri de bază a modului în care corpul uman consumă energia.


Incapacitatea de a interpreta etichetele alimentelor și de a distinge corect între macronutrienți (proteine, carbohidrați, grăsimi).


Lipsa unor materiale didactice aplicate, care să transforme teoria nutriției într-o experiență vizuală și ușor de asimilat.


Absența unui sistem de autoevaluare care să corecteze miturile alimentare adânc înrădăcinate.


NutriTECH rezolvă aceste neajunsuri prin transformarea procesului de monitorizare într-o lecție continuă de auto-educație.


🌟 Ce este NutriTECH?

NutriTECH este:

Un manual digital interactiv care ghidează utilizatorul în înțelegerea propriului corp.


Un simulator metabolic prin care elevii învață formulele matematice din spatele caloriilor.


Un instrument pedagogic de monitorizare, conceput pentru deprinderea unui stil de viață echilibrat.


Un centru de testare și validare a cunoștințelor prin gamificare (recompense și ecusoane).

🔑 Funcționalități în detaliu

🏫 Modulul pedagogic de calcul metabolic

Învățare prin experiment: Utilizatorul își introduce datele antropometrice (înălțime, greutate, vârstă) nu doar pentru a primi niște cifre, ci pentru a învăța cum se determină rata metabolică.


Înțelegerea conceptelor cheie: Aplicația explică practic diferența dintre BMR (energia necesară supraviețuirii) și TDEE (energia consumată în funcție de mișcare).


Alfabetizarea macronutrienților: Utilizatorul învață cum se împarte necesarul caloric în proteine, carbohidrați și grăsimi, înțelegând rolul vital al fiecăruia în organism.


📝 Jurnalul ca exercițiu practic (Daily Log)

Conștientizarea aportului alimentar: Prin adăugarea alimentelor și exercițiilor fizice, utilizatorul deprinde abilitatea de a evalua densitatea calorică a alimentelor și de a înțelege balanța energetică (calorii intrate vs. calorii arse).


Vizualizarea structurii nutriționale: Datele sunt stocate inteligent (în format JSON), permițând utilizatorului să observe la finalul zilei un raport clar al modului în care a mâncat.


🧠 Corectarea miturilor prin Engine-ul de Quiz

Evaluare formativă: Teste interactive împărțite pe arii tematice esențiale: calorii, macronutrienți, hidratare și somn.


Feedback didactic imediat: Fiecare întrebare este însoțită de explicații științifice detaliate. Dacă utilizatorul greșește, sistemul nu doar că îl depunctează, ci îi explică de ce varianta aleasă era un mit și care este adevărul biologic.


Sistem de Gamificare: Pentru a stimula dorința de învățare, obținerea unui scor de peste 80% deblochează un ecuson (badge) tematic salvat în baza de date, validând progresul educațional al elevului.


🔒 Arhitectură suport sigură & Mod Offline

Găzduire modernă: Proiectul rulează în regim Serverless pe platforma Netlify, oferind un exemplu tehnologic avansat de bune practici în programare.


Accesibilitate universală: Datorită modului hibrid, elevii pot folosi aplicația și învăța local (prin localStorage) chiar și fără a-și crea un cont, datele fiind sincronizate securizat în PostgreSQL (prin hash-uri bcrypt) doar când doresc salvarea istoricului.


🧪 Scenariu de utilizare pedagogic

Descoperirea: Utilizatorul accesează platforma și parcurge configurarea de profil, unde învață să își calculeze necesarul caloric zilnic.


Aplicarea practică: Pe parcursul unei zile, folosește jurnalul pentru a transpune teoria în practică, analizând ce nutrienți conțin mesele sale.


Evaluarea cunoștințelor: Intră în secțiunea de Quiz pentru a-și testa logica în fața unor probleme reale de nutriție.


Fixarea informației: Citește explicațiile detaliate afișate la finalul testului pentru a asimila corect noțiunile ratate.


Recompensarea: Primește ecusonul de "Expert în Hidratare" sau "Master în Macronutrienți", fapt ce îi crește motivația de a continua auto-educarea.


🛠️ Tehnologii utilizate

Frontend: HTML5, CSS3, JavaScript (Vanilla JS / ES6+) — asincron, interfață dinamică.


Interfață & Ergonomie: Framework-ul Bootstrap 5 și Bootstrap Icons pentru un design fluid, adaptat publicului tânăr.


Backend & Data Layer: Node.js cu Express și bază de date relațională PostgreSQL pentru stocarea progresului și a istoricului educațional.


Hosting Cloud: Netlify (Netlify Functions / serverless-http), o abordare modernă de tip microservicii serverless.


📂 Structura proiectului

netlify/functions/api.js — Endpoint-ul Serverless care deservește platforma în cloud.


views/ — Interfețele educaționale (profile.html, quiz.html etc.).


public/ — Resursele statice (stiluri css și scripturile js care gestionează logica offline).


routes/api.js — Logica de procesare a răspunsurilor de la quiz și gestionarea tabelelor de utilizatori.


lib/db.js — Conexiunea securizată cu baza de date PostgreSQL.


server.js — Mediul de rulare local pentru testare.


📈 Direcții de dezvoltare (Viitor)

Crearea unei secțiuni de mini-articole și glosar de termeni medicali/nutriționali.


Adăugarea de grafice interactive pentru vizualizarea evoluției obiceiurilor alimentare.


Un modul de simulare a etichetelor, unde utilizatorii să exerseze citirea valorilor nutriționale de pe produse.


🙋‍♀️ Public-țintă

Elevi, studenți și tineri care vor să își însușească noțiunile de bază ale unei vieți sănătoase.


Cadre didactice care pot folosi platforma ca material auxiliar la orele de biologie sau consiliere.


📜 Licență

Acest proiect este licențiat sub MIT License.


✍️ Autor

Nume: Moldovan Marius Cristian

Un tânăr dornic de a cunoaște secretele programării.

Contact: cristianmoldovan291@gmail.com
