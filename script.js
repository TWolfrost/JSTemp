const LETTERS = $("td");
const HANGMANCTX = $("#hangman")[0].getContext("2d");
const WORD = $("#word")[0];

HANGMANCTX.lineCap = "round";
HANGMANCTX.lineJoin = "round";


let word, points;

newGame();

$(document).on("keydown", (e) => e.keyCode == 32 ? document.location.reload() : 0);

function keyPress(e)
{
   if (e.code.includes("Key"))
   {
      e.target.value = e.key;

      e.preventDefault();

      nextCharObj(+e.target.id).focus();
   }
   else
   {
      e.preventDefault();
   }
};
function keyDown(e)
{
   if (e.target.id == "" && !e.ctrlKey && !e.metaKey)
   {
      if (e.code.includes("Key"))
      {
         $("#"+e.key.toUpperCase()).click();
      }
   }
   else
   {
      e.target.selectionStart = 1;

      if (e.keyCode == 8 && e.target.value.length == 0) //backspace
      {
         prevCharObj(+e.target.id).focus();
      }
      else if (e.keyCode == 46) //del
      {
         e.target.value = "";

         nextCharObj(+e.target.id).focus();
      }
      else if (e.keyCode == 13) //enter
      {
         if (checkWin() == false) losePoint();
      }
   }
};
function keyClick(e)
{
   if (e.target.classList.contains("locked") == false)
   {
      e.target.style.cursor = "default";

      if (checkLetter(e.target.innerText) == false)
      {
         e.target.classList.add("wrong");
         losePoint();
      }
      else
      {
         e.target.classList.add("right");
         checkWin(false);
      }
   }
};


function newGame()
{
   word = randWord().toUpperCase();
   createWord(word);

   points = drawHangman();
   losePoint();

   WORD.classList = "";

   LETTERS.removeClass();

   $(".char").on("keypress", keyPress);
   $(document).on("keydown", keyDown);
   LETTERS.on("click", keyClick);
};


function checkWin(lockWordIfWin=true)
{
   function gameWin()
   {
      WORD.classList.add("win");

      LETTERS.off();
   }

   function getFullWord(allChars)
   {
      let fullWord = "";

      for (let i = 0; i < word.length; i++)
      {
         const char = $("#"+i)[0];
         if (char.classList.contains("locked") || allChars) fullWord += char.value;
         else fullWord += "_";
      }

      return normalize(fullWord).toUpperCase();
   }


   if (getFullWord(lockWordIfWin) == normalize(word))
   {
      if (lockWordIfWin) lockWord();
      gameWin();

      return true;
   }
   else return false;
};
function losePoint()
{
   function gameLost()
   {
      WORD.classList.add("lose");

      LETTERS.off()
   }

   if (points.next().value == 0)
   {
      lockWord("lose");
      gameLost();
   }
};


function checkLetter(letter, lock=true)
{
   let normalizedWord = normalize(word);
   let found = false;

   for (let i=0; i < word.length; i++)
   {
      if (normalizedWord[i] == letter)
      {
         if (lock)
         {
            const char = $(`#${i}`);

            char[0].value = word[i];
            char[0].classList.add("locked");
            char[0].disabled = true;
            char.off();
         }

         found = true;
      }
   }

   return found;
};

function lockWord(classAdd=false)
{
   for (let i=0; i < word.length; i++)
   {
      const char = $("#"+i);

      if (char[0].value != word[i])
      {
         char[0].value = word[i];

         if (classAdd) char[0].classList.add(classAdd);
      }

      char[0].classList.add("locked");
      char[0].disabled = true;
      char.off();
   }
};


function* drawHangman()
{
   function getIntervals(a, b, steps=1, edges=true)
   {
      let floatFix = (n) => Number.parseFloat(n.toFixed(15));

      steps++;
      const BEG = edges ? 0 : 1;
      const END = edges ? steps : steps-1;

      let intervals = [];

      if (typeof a === "number" && typeof b === "number")
      {
         for (let i=BEG; i <= END; i++)
         {
            intervals.push(floatFix(a + (b-a) * i / steps));
         }
      }
      else if (a.length == b.length)
      {
         for (let i=BEG; i <= END; i++)
         {
            let curInterval = [];

            for (let j=0; j < a.length; j++)
            {
               curInterval.push(floatFix(a[j] + (b[j]-a[j]) * i / steps));
            }

            intervals.push(curInterval)
         }
      }

      return intervals;
   }

   function animateLine(ctx, cords, totms=200, totsteps=20, callback=null)
   {
      function animateSingleLine(ctx, begcords, endcords, ms=100, steps=10, callback=null)
      {
         function drawLine(ctx, begpoints, endpoints)
         {
            ctx.beginPath();

            ctx.strokeStyle = "black";
            ctx.lineWidth = 12;

            ctx.moveTo(begpoints[0], begpoints[1]);
            ctx.lineTo(endpoints[0], endpoints[1]);
            ctx.stroke();

            ctx.closePath();
         };

         const STEPMS = ms/steps;

         let waypoints = getIntervals(begcords, endcords, steps)
         let curWaypoint = 0;

         let id = setInterval(function()
         {
            if (curWaypoint == waypoints.length-1)
            {
               clearInterval(id);
               callback?.();
            }
            else drawLine(ctx, waypoints[curWaypoint], waypoints[++curWaypoint])
         }, STEPMS)
      };

      const STEPMS = Math.round(totms/cords.length);
      const STEP = Math.round(totsteps/cords.length);

      let lineChain = () => animateSingleLine(ctx, cords.at(-2), cords.at(-1), STEPMS, STEP, callback?.())

      for (let i=cords.length-2; i>0; i--)
      {
         if (cords[i-1] == false) i-=2;

         let tempLineChain = lineChain;
         lineChain = () => animateSingleLine(ctx, cords[i-1], cords[i], STEPMS, STEP, tempLineChain)
      }

      lineChain();
   };

   function animateEllipse(ctx, center, radius, startDegrees=0, ms=100, steps=5)
   {
      function drawEllipse(ctx, center, radius, start=0, end=Math.PI*2)
      {
         ctx.beginPath();

         ctx.strokeStyle = "black";
         ctx.lineWidth = 12;

         ctx.ellipse(center[0], center[1], radius[0], radius[1], 0, start, end);

         ctx.stroke();

         ctx.closePath();
      };

      const STARTPI = Math.PI * startDegrees/180;
      const STEPMS = ms/steps;

      let waypoints = getIntervals(0, Math.PI*2, steps)
      let curWaypoint = 0;

      let id = setInterval(function()
      {
         if (curWaypoint == waypoints.length-1) clearInterval(id)
         else drawEllipse(ctx, center, radius, waypoints[curWaypoint] + STARTPI, waypoints[++curWaypoint] + STARTPI)
      }, STEPMS)
   };

   function clearContext(ctx)
   {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
   };

   let health = 6;

   clearContext(HANGMANCTX);


   animateLine(HANGMANCTX, [[45, 280], [121, 280], false, [83, 280], [83, 20], [217, 20], [217, 80], false, [83, 80], [143, 20]], 500, 50) //hanger

   yield health;

   animateEllipse(HANGMANCTX, [217, 105], [25, 25], 270); //head

   yield --health;

   animateLine(HANGMANCTX, [[217, 130], [217, 210]]); //body

   yield --health;

   animateLine(HANGMANCTX, [[217, 150], [175, 165]]); //left arm (viewer pov)

   yield --health;

   animateLine(HANGMANCTX, [[217, 150], [259, 165]]); //right arm (viewer pov)

   yield --health;

   animateLine(HANGMANCTX, [[217, 210], [190, 245]]); //left leg (viewer pov)

   yield --health;

   animateLine(HANGMANCTX, [[217, 210], [244, 245]]); //right leg (viewer pov)

   yield --health;
};

function createWord(word, reset=true)
{
   if (reset) WORD.innerHTML = "";

   const DEF_CHAR = document.createElement("input");
   DEF_CHAR.className = "char";
   DEF_CHAR.maxLength = 1;

   for (let i=0; i<word.length; i++)
   {
      const CHAR = DEF_CHAR.cloneNode(true);
      CHAR.id = i;

      WORD.appendChild(CHAR);
   }
};


function nextCharObj(cur)
{
   for (let i = cur+1; i < word.length; i++)
   {
      const char = $("#"+i);

      if (char[0].classList.contains("locked") == false) return char;
   }

   return $("#"+cur);
};
function prevCharObj(cur)
{
   for (let i = cur-1; i >= 0; i--)
   {
      const char = $("#"+i);

      if (char[0].classList.contains("locked") == false) return char;
   }

   return $("#"+cur);
};


function randWord()
{
   const wordList = [
      "abitante","acqua","aereo","aeroporto","agosto",
      "aiuto","albergo","albero","amico","amore",
      "andata","animale","anno","appartamento","aprile",
      "arrivo","arte","artista","attenzione","auto",
      "autobus","autunno","bacio","bagno","bambino",
      "banca","bar","barista","bicchiere","bicicletta",
      "biglietto","binario","birra","bistecca","bocca",
      "borsa","bottiglia","bruschetta","caffè","caffelatte",
      "calendario","camera","cameriere","camicia","campagna",
      "cane","cantante","canzone","capello","capitale",
      "capodanno","cappuccino","carabiniere","carattere","carne",
      "carnevale","carta","casa","casalinga","casino",
      "cassa","cena","centro","chiave","chiesa",
      "chilo","chilometro","cielo","cinema","cioccolato",
      "città","cognome","colazione","colore","coltello",
      "compleanno","cornetto","costo","cucina","cugino",
      "cultura","destra","dialetto","dicembre","direttore",
      "discoteca","doccia","domanda","domenica","donna",
      "dottore","droga","entrata","erba","errore",
      "esempio","est","estate","euro","fame",
      "famiglia","fantasia","febbraio","femmina","ferie",
      "fermata","ferragosto","festa","fidanzato","figlio",
      "film","finestra","fiore","firma","fiume",
      "formaggio","fortuna","fotografia","fratello","frutta",
      "fumo","fuoco","futuro","gatto","gelato",
      "genitore","gennaio","gente","giacca","giardino",
      "gioco","giornale","giornalista","giorno","giovedì",
      "giugno","gruppo","idea","immigrato","immigrazione",
      "indirizzo","informazione","insalata","insegnante","inverno",
      "isola","istituto","lago","latte","lavoratore",
      "lavoro","legno","letto","libertà","libro",
      "lingua","luglio","luna","lunedì","macchina",
      "madre","mafia","mafioso","maggio","malato",
      "male","mamma","mano","mare","marito",
      "martedì","marzo","mattina","medicina","medico",
      "mercoledì","mese","metallo","metropolitana","mezzanotte",
      "mezzogiorno","minestra","minestrone","minuto","moda",
      "moglie","momento","mondo","montagna","monumento",
      "muro","museo","musica","naso","natale",
      "nave","nazionalità","nazione","ndrangheta","negozio",
      "neve","nipote","noia","nome","nonno",
      "nord","notte","novembre","numero","occhio",
      "olio","ora","orecchio","oro","orologio",
      "ospedale","ottobre","ovest","padre","paese",
      "palazzo","pallone","pane","pantalone","papà",
      "parco","parente","parola","pasqua","passeggiata",
      "pasta","patata","paura","pazzo","penna",
      "pepe","persona","pesce","piatto","piazza",
      "piede","pioggia","pizza","pizzeria","politica",
      "polizia","poliziotto","pollo","pomeriggio","pomodoro",
      "ponte","porta","porto","possibilità","posta",
      "pranzo","presidente","prezzo","primavera","problema",
      "professore","ragazzo","re","regista","religione",
      "repubblica","ristorante","ritorno","rosa","sabato",
      "salame","sale","salotto","scarpa","scuola",
      "secolo","secondo","sedia","sera","sesso",
      "sete","settembre","settimana","sigaretta","signore",
      "sinistra","sole","sonno","sorella","spaghetto",
      "spicciolo","sport","stadio","stagione","stanza",
      "stazione","storia","strada","straniero","studente",
      "sud","suocera","tavolo","taxi","tazza",
      "teatro","telefonino","telefono","televisione","tempo",
      "testa","tiramisù","torta","tortellino","traffico",
      "tram","treno","turista","università","uomo",
      "vacanza","venerdì","vestito","vetro","via",
      "viaggio","villa","vino","visto","vita",
      "volta","zio","zucchero",
   ];

   return wordList[ Math.random()*wordList.length | 0 ];
};

function normalize(word)
{
   return word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};


function debug(text, id="debugText")
{
   text = JSON.stringify(text);

   if (id === true || document.getElementById(id) === null)
   {
      let debugtxt = document.createElement("p");
      debugtxt.id = id;
      debugtxt.innerText = text;
      debugtxt.style.fontSize = "20px";
      document.body.appendChild(debugtxt);
   }

   else document.getElementById(id).innerText = text;
};