const baseUrl = "http://localhost:8000/api/";

const inputExpedCompteTel = document.querySelector('#expediteur_compte_tel') as HTMLInputElement;
const inputExpedNom = document.querySelector('#expediteur_nom_complet') as HTMLInputElement;
const inputMontant = document.querySelector('#montant') as HTMLInputElement;
const inputFournisseur = document.querySelector('#fournisseur') as HTMLInputElement;
const inputTypeTransaction = document.querySelector('#type_transaction') as HTMLInputElement;
const inputDestCompteTel = document.querySelector('#destinataire_compte_tel') as HTMLInputElement;
const inputDestNom = document.querySelector('#destinataire_nom_complet') as HTMLInputElement;
const btnValider = document.querySelector('#btn-valider') as HTMLButtonElement;
const btnConsulterExp = document.querySelector('#expediteur_btn') as HTMLButtonElement;

const inputElements: HTMLInputElement[] = [inputExpedCompteTel, inputExpedNom, inputMontant, inputFournisseur, inputTypeTransaction, inputDestCompteTel,inputDestNom];

type Transaction = {
    "type": string;
    "montant": number;
    "frais": number;
    "immediat": boolean;
    "code": string | null;
    "created_at": string;
};
type Compte = {
    "id": number;
    "numeroCompte": string;
    "solde": number;
    "fournisseur": 'ORANGE MONEY' | 'WAVE' | 'WARI' | 'CB';
    "client_id": number;
};
type Client = {
   "id" : number,
   "prenom": string,
   "nom": string,
   "tel": string,
   "comptes": Compte[]
};
  

let clients: Client[];
let comptes: Compte[];
let compteExp: Compte;
let compteDes: Compte;
let expediteur:Client;
let destinataire:Client;
let fournisseur:string;
let typeTransaction:string;

const couleurs: {
    [key: string]: string;
  } = {"ORANGE MONEY":"bg-danger", "WAVE":"bg-primary", "WARI":"bg-success", "CB":"bg-secondary"};


fetch(baseUrl+'clients', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // body: JSON.stringify(data)
})
.then(response => response.json())
.then(responseData => {
    clients = responseData.data;
})
.catch(error => {
console.error('Une erreur s\'est produite:', error);
});

fetch(baseUrl+'comptes', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
})
.then(response => response.json())
.then(responseData => {
    comptes = responseData.data;
})
.catch(error => {
console.error('Une erreur s\'est produite:', error);
});



inputExpedCompteTel?.addEventListener('input',()=>{
    const saisie = removeSpaces(inputExpedCompteTel.value);
    const msgError = document.querySelector("#msg-expediteur_compte_tel")

    if(isNumberPhone(saisie)){
        for (const client of clients) {
            if(removeSpaces(client.tel) !== saisie){
                msgError!.textContent = "Numéro de téléphone introuvale (incorrecte..)";
                addIfNotExists(inputElements, inputExpedCompteTel);
            }else{
                expediteur=client
                removeIfExists(inputElements, inputExpedCompteTel);
                activeButton(inputElements, btnValider);
                msgError!.textContent = null;
                break;
            }
        }
    }else{
        for (const compte of comptes){
            if(compte.numeroCompte !== saisie){
                msgError!.textContent = "Numéro de compte introuvale (incorrecte..)";
                addIfNotExists(inputElements, inputExpedCompteTel);
            }else{
                compteExp = compte
                const cl = getClientById(clients,compte.client_id);
                if(cl){
                    expediteur = cl;
                }
                removeIfExists(inputElements, inputExpedCompteTel);
                activeButton(inputElements, btnValider);
                msgError!.textContent = null;
                break;
            }
        }
    }
    
})

inputExpedNom?.addEventListener("input", ()=>{
    const saisie = inputExpedNom.value;
    const msgError = document.querySelector("#msg-expediteur_nom_complet")
    const nomComplet = trouveNomPrenom(saisie);
    const prenom = nomComplet[0];
    const nom = nomComplet[1];
    if (prenom === expediteur.prenom && nom === expediteur.nom) {
        msgError!.textContent = null;
        removeIfExists(inputElements, inputExpedNom);
        activeButton(inputElements, btnValider);
    }else{
        msgError!.textContent = "Nom incorrecte";
        addIfNotExists(inputElements, inputExpedNom);
    }
})

inputFournisseur?.addEventListener("change",()=>{
    const saisie:string = inputFournisseur.value;
    const msgError = document.querySelector("#msg-fournisseur")
    if(saisie=="" || saisie== null || saisie== undefined){
        msgError!.textContent = "Veuillez faire un choix...";
        addIfNotExists(inputElements, inputFournisseur);
    }else{
        const titleExp = document.querySelector("#title-exp");
        removeClassesByPrefix(titleExp, "bg-")
        titleExp?.classList.add(couleurs[saisie]);
        removeIfExists(inputElements, inputFournisseur);
        msgError!.textContent = null;
        fournisseur = saisie
        activeButton(inputElements, btnValider);
        for (const compte of expediteur.comptes) {
            if(compte.fournisseur === saisie){
                compteExp = compte
            }
        }
    }
})

inputTypeTransaction?.addEventListener("change",()=>{
    const saisie = inputTypeTransaction.value;
    const msgError = document.querySelector("#msg-type_transaction")
    if(saisie=="" || saisie== null || saisie== undefined){
        msgError!.textContent = "Veuillez faire un choix...";
        addIfNotExists(inputElements, inputTypeTransaction);
    }else{
        const destinataire = document.querySelector("#destinataire") as HTMLElement;
        if (saisie === "TRANSFERT") {
            destinataire!.style.display = 'block';
        }else{
            destinataire!.style.display = 'none';
        }
        msgError!.textContent = null;
        removeIfExists(inputElements, inputTypeTransaction);
        typeTransaction = saisie
        activeButton(inputElements, btnValider);
    }
})

inputMontant?.addEventListener("input", ()=>{
    const saisie = inputMontant.value;
    const msgError = document.querySelector("#msg-montant")
    if(fournisseur === "CB"){
        if(isNumber(saisie,10000)){
            msgError!.textContent = null;
            removeIfExists(inputElements, inputMontant);
            activeButton(inputElements, btnValider);
        }else{
            msgError!.textContent = "Le montant doit etre un entier supérieur à 10.000";
            addIfNotExists(inputElements, inputMontant);
        }
    }else if(fournisseur === "WARI"){
        if(isNumber(saisie,1000, 1000000)){
            msgError!.textContent = null;
            removeIfExists(inputElements, inputMontant);
            activeButton(inputElements, btnValider);
        }else{
            msgError!.textContent = "Le montant doit etre un entier compris entre 1.000 et 1.000.000";
            addIfNotExists(inputElements, inputMontant);
        }
    }else{
        if(isNumber(saisie,500, 1000000)){
            msgError!.textContent = null;
            activeButton(inputElements, btnValider);
            removeIfExists(inputElements, inputMontant);
        }else{
            msgError!.textContent = "Le montant doit etre un entier compris entre 500 et 1.000.000";
            addIfNotExists(inputElements, inputMontant);
        }
    }
})

inputDestCompteTel?.addEventListener('input',()=>{
    const saisie = removeSpaces(inputDestCompteTel.value);
    const msgError = document.querySelector("#msg-destinataire_compte_tel")
    if(isNumberPhone(saisie)){
        for (const client of clients) {
            if(removeSpaces(client.tel) !== saisie){
                msgError!.textContent = "Numéro de téléphone introuvale (incorrecte..)";
                addIfNotExists(inputElements, inputDestCompteTel);
            }else{
                destinataire = client
                msgError!.textContent = null;
                removeIfExists(inputElements, inputDestCompteTel);
                activeButton(inputElements, btnValider);
                const titleExp = document.querySelector("#title-dest");
                removeClassesByPrefix(titleExp, "bg-")
                titleExp?.classList.add(couleurs[inputFournisseur.value]);
                break;
            }
        }
    }else{
        for (const compte of comptes){
            if(compte.numeroCompte !== saisie){
                msgError!.textContent = "Numéro de compte introuvale (incorrecte..)";
                addIfNotExists(inputElements, inputExpedCompteTel);
            }else{
                compteDes = compte
                const cl = getClientById(clients,compte.client_id);
                if(cl){
                    destinataire = cl;
                }
                removeIfExists(inputElements, inputExpedCompteTel);
                activeButton(inputElements, btnValider);
                msgError!.textContent = null;
                const titleExp = document.querySelector("#title-dest");
                removeClassesByPrefix(titleExp, "bg-")
                titleExp?.classList.add(couleurs[inputFournisseur.value]);
                break;
            }
        }
    }
    
})

inputDestNom?.addEventListener("input", ()=>{
    const saisie = inputDestNom.value;
    const msgError = document.querySelector("#msg-destinataire_nom_complet")
    const nomComplet = trouveNomPrenom(saisie);
    const prenom = nomComplet[0];
    const nom = nomComplet[1];
    if (prenom === destinataire.prenom && nom === destinataire.nom) {
        msgError!.textContent = null;
        removeIfExists(inputElements, inputDestNom);
        activeButton(inputElements, btnValider);
    }else{
        msgError!.textContent = "Nom incorrecte";
        addIfNotExists(inputElements, inputDestNom);
    }
})


btnValider.addEventListener("click",()=>{
    const msgError = document.querySelector("#msg-error");
    if (!compteExp) {
        displayError3Seconds(msgError,"Attention: l'expéditeur n'a de compte sur "+inputFournisseur.value,"text-danger");
    }else{  
        let data = null;
        let url:string;
        if (inputTypeTransaction.value === "DEPOT") {
            data = {
                "compte_id":compteExp.id,
                "montant":+inputMontant.value,
            };
            url = "depot";
        }else if(inputTypeTransaction.value === "RETRAIT"){
            data = {
                "compte_id":compteExp.id,
                "montant":+inputMontant.value,
            };
            url = "retrait";
        }else{
            let asCompte = false;
            for (const compte of destinataire.comptes) {
                if(compte.fournisseur === inputFournisseur.value){
                    asCompte = true;
                    compteDes = compte;
                    break;
                }
            }
            if(!asCompte){
                if(inputFournisseur.value === "ORANGE MONEY"){
                    launchPopupCode('Le client '+destinataire.prenom+" "+destinataire.nom+" n'a pas de Orange Money voulez faire un envoi par code?");
                    return;
                }
                displayError3Seconds(msgError,"Attention: le destinataire n'a de compte sur "+inputFournisseur.value,"text-danger");
                return;
            }else{
                data = {
                    "compte_source_id":compteExp.id,
                    "compte_destinataire_id":compteDes.id,
                    "montant":+inputMontant.value
                };
                url = "transfert";
            }
        }

        fetch(baseUrl+url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(responseData => {
            if(responseData.statut === 200){
                displayError3Seconds(msgError,responseData.message,"text-success");
            }else{
                displayError3Seconds(msgError,responseData.message,"text-danger");
            }
        })
        .catch(error => {
        console.error('Une erreur s\'est produite:', error);
        });
    }
    
})


btnConsulterExp.addEventListener('click',()=>{

    let transactions : Transaction[] = [];

    fetch(baseUrl+'clients/'+expediteur.id+'/transactions', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(responseData => {
        transactions = responseData.data;
        lancePopup(expediteur, transactions);
    })
    .catch(error => {
    console.error('Une erreur s\'est produite:', error);
    });

})






function removeSpaces(inputString: string): string {
    return inputString.replace(/\s/g, '');
} 

function trouveNomPrenom(chaine: string): [string, string] {
    const index = chaine.lastIndexOf(' ');
    if (index === -1) {
      return [chaine, ''];
    } else {
      const part1 = chaine.substring(0, index);
      const part2 = chaine.substring(index + 1);
      return [part1, part2];
    }
}

function isNumber(chaine: string, debut:number, fin:number=999000000000): boolean {
    const num = parseInt(chaine);
    return Number.isInteger(num) && num >= debut && num <= fin;
}

function addIfNotExists<T>(array: T[], element: T): void {
    if (!array.includes(element)) {
      array.push(element);
    }
}

  function removeIfExists<T>(array: T[], element: T): void {
    const index = array.indexOf(element);
    if (index !== -1) {
      array.splice(index, 1);
    }
}

function activeButton(tab: HTMLInputElement[], button: HTMLButtonElement): void {
    
    // if (tab.length === 0) {
    //   button.disabled = false;
    // } else {
    //   button.disabled = true;
    // }
  }
  
  function isNumberPhone(chaine: string): boolean {
    const regex = /^\d{2}/;
    return regex.test(chaine);
}  

function getClientById(clients: Client[], id: number): Client | undefined {
    return clients.find((client) => client.id === id);
}

function displayError3Seconds(element: Element | null, text: string, className: string): void {
    if (element) {
        element.textContent = text;
        element.classList.add(className);
    
        setTimeout(() => {
        element.textContent = '';
        element.classList.remove(className);
        }, 3000);
    }
}
  

function removeClassesByPrefix(element: Element | null, prefix: string): void {
    if(!element) return;
    if (element.classList.length === 0) {
      return; 
    }
  
    const classesToRemove: string[] = [];
  
    for (const className of element.classList) {
      if (className.startsWith(prefix)) {
        classesToRemove.push(className);
      }
    }
  
    for (const classToRemove of classesToRemove) {
      element.classList.remove(classToRemove);
    }
}



function lancePopup(client: Client, transactions: Transaction[]): void {
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    const popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');
  
    let mesComptes:any;
    for (const compte of client.comptes) {
        mesComptes = `
          <div>---  <b>Fournisseur</b> : ${compte.fournisseur}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <b>Solde</b> : ${compte.solde} F CFA</div>
        `;
      }
    const clientInfo = document.createElement('div');
    clientInfo.innerHTML = `
      <h1 class="bg-primary text-white text-center">Informations du client</h1>
      <p><b>Prénom</b> : &nbsp;&nbsp; ${client.prenom} 
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <b>Nom </b>: &nbsp;&nbsp; ${client.nom} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
         <b>Téléphone</b> : &nbsp;&nbsp; ${client.tel}</p>
      <H4>Comptes : </h4>${mesComptes}
    `;
    popupDiv.appendChild(clientInfo);
  
    const transactionsList = document.createElement('div');
    transactionsList.innerHTML = '<h2 class="bg-secondary text-white text-center">Liste des transactions</h2>';
  
    if (transactions.length > 0) {
      const transactionsTable = document.createElement('table');
      transactionsTable.classList.add('transactions-table', 'bg-success',"text-white");
      transactionsTable.innerHTML = `
        <tr>
          <th>Numéro</th>
          <th>Type</th>
          <th>Montant</th>
          <th>Frais</th>
          <th>Immédiat</th>
          <th>Code</th>
          <th>Date</th>
        </tr>
      `;
  
      for (let i = transactions.length - 1; i >= 0; i--) {
        const transaction = transactions[i];
        const transactionRow = document.createElement('tr');
        transactionRow.innerHTML = `
          <td>${transactions.length - i}</td>
          <td>${transaction.type}</td>
          <td>${transaction.montant}</td>
          <td>${transaction.frais}</td>
          <td>${transaction.immediat ? 'Oui' : 'Non'}</td>
          <td>${transaction.code ? transaction.code : '-'}</td>
          <td>${formatDate(transaction.created_at)}</td>
        `;
        transactionsTable.appendChild(transactionRow);
      }      
  
      transactionsList.appendChild(transactionsTable);
    } else {
      transactionsList.innerHTML += '<p class="text-danger">Aucune transaction enregistrée.</p>';
    }
  
    popupDiv.appendChild(transactionsList);
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'OK';
    closeButton.classList.add('btn', 'btn-primary', 'btn-lg', 'd-block', 'mx-auto', 'mt-5', 'py-3','px-5');
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  
    popupDiv.appendChild(closeButton);
  
    overlay.appendChild(popupDiv);
    document.body.appendChild(overlay);
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}-${year} à ${hours}h-${minutes}mn`;

}


function launchPopupCode(message: string): void {
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    const popupDiv = document.createElement('div');
    popupDiv.classList.add('popup');
  
    const messageElement = document.createElement('h2');
    messageElement.textContent = message+ " (code: 9007199254740991)";
    messageElement.classList.add('text-danger',"text-center","m-5");
    popupDiv.appendChild(messageElement);
  
    const buttonsDiv = document.createElement('div');
    buttonsDiv.classList.add('text-center', "m-2");
  
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Annuler';
    cancelButton.classList.add('btn', 'btn-danger', "mx-5", "px-5");
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay); 
    });
    buttonsDiv.appendChild(cancelButton);
  
    const validateButton = document.createElement('button');
    validateButton.textContent = 'Valider';
    validateButton.classList.add('btn', 'btn-primary', "mx-5", "px-5");
    validateButton.addEventListener('click', () => {
        fetch(baseUrl+'transfert-par-code', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
                "compte_source_id":compteExp.id,
                "destinataire_id":destinataire.id,
                "montant":+inputMontant.value
            })
        })
        .then(response => response.json())
        .then(responseData => {
            const msgError = document.querySelector("#msg-error");
            displayError3Seconds(msgError,"Transfert réssi avec succées","text-success");
        })
        .catch(error => {
        console.error('Une erreur s\'est produite:', error);
        });        
      document.body.removeChild(overlay);
    });
    buttonsDiv.appendChild(validateButton);
  
    popupDiv.appendChild(buttonsDiv);
    
    overlay.appendChild(popupDiv);
    document.body.appendChild(overlay);
}
  

  