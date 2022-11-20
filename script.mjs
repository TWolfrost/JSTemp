import CLASSES from "./classes.json" assert {type: "json"}

alert(CLASSES);

const NUMGROUPS = document.getElementById("groups");
const SELCLASS = document.getElementById("class");
const SHUFFLE = document.getElementById("shuffle");
const DRAW = document.getElementById("draw");

SHUFFLE.addEventListener("click", function drawCurrent()
{
   let curClass = CLASSES[SELCLASS.value];
   let numGroups = NUMGROUPS.value;

   let drawed = draw(curClass, numGroups);

   let perGroup = Math.floor(curClass.length / numGroups);

   if (curClass.length % perGroup != 0) perGroup++;

   setTable(DRAW, drawed, NUMGROUPS.value, perGroup);
})

function draw(_class, numGroups)
{
   function shuffle(arr)
   {
      for (let i=arr.length-1; i > 0; i--)
      {
         let j = Math.floor(Math.random() * (i+1));
         [arr[i], arr[j]] = [arr[j], arr[i]];
      }

      return arr;
   }

   const perGruppo = Math.floor(_class.length / numGroups);


   let groups = [];


   _class = shuffle(_class)

   for (let i=0; i<_class.length; i+=perGruppo) groups.push(_class.slice(i, i+perGruppo))


   if (groups.length > numGroups)
   {
      let remGroups = groups.slice(numGroups).flat();

      groups = groups.slice(0, numGroups);

      let randArray = []

      for (let i=0; i<remGroups.length; i++)
      {
         let rand;

         do {
            rand = Math.floor(Math.random() * (groups.length));
         } while (randArray.includes(rand))

         randArray.push(rand);
         groups[rand].push(remGroups[i])
      }
   }

   return groups;
}

function setTable(table, drawed, _class, perGroupMax)
{
   table.innerHTML = "";

   const TH = document.createElement("th");
   TH.colSpan = 10;
   TH.innerText = "Sorteggi";

   table.appendChild(TH);


   const GROUPTR = document.createElement("tr");
   table.appendChild(GROUPTR);

   for (let i=0; i<_class; i++)
   {
      const TD = document.createElement("td");

      TD.innerText = `${i+1}° GRUPPO`;
      TD.style.fontWeight = "bold";

      GROUPTR.appendChild(TD);
   }

   for (let i=0; i<perGroupMax; i++)
   {
      const TR = document.createElement("tr");
      table.appendChild(TR);

      for (let j=0; j<_class; j++)
      {
         const TD = document.createElement("td");

         TD.innerText = drawed[j][i] ?? "";

         TR.appendChild(TD);
      }
   }

   return 0;
}