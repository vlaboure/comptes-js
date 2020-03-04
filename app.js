var BudgetController=(function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;//-1 à l'init stockage des pourcentages par ligne
    };
            //calcul de pourcentage
    Expense.prototype.calcPercentage=function(totIncome){
        if(totIncome>0)
            this.percentage=Math.round((this.value/totIncome)*100);
            else this.percentage=-1;

    };
            // retour du pourcentage
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };

    var Income=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };

    var calculTot=function(type){
        var sum=0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
      
        data.totals[type]=sum;
    }
        //*****type est utilisé pourl'accès aux valeurs de data
        //on utilise le exp et le inc pour un accès aux valeurs d'objet par 
        
    var data={
        // !!!!!!!!!!!!!!OBJET = VIRGULE !!!!!!!!!!!!!!!!!!!!!!!!
        //2 tableaux pour accéder aux valeurs dépenses entrées
        allItems:{
            exp:[],
            inc:[]
        },
        //les totaux dépenses et entrées
        totals:{
            exp:0,
            inc:0
        },
         budget:0,
         percent:-1
    };   
    return{
        addItem:function(type,desc,val){
            var newItem,Id;
            //
            if(data.allItems[type].length>0)
                Id=data.allItems[type][data.allItems[type].length-1].id + 1;
                else
                Id=0;                           
            if (type==='exp'){
                newItem=new Expense(Id,desc,val);
            }else if(type==='inc'){
                newItem=new Income(Id,desc,val);
            }
            //ajout des valeurs dans l'objet data
            data.allItems[type].push(newItem);
            // on connecte l'UI avec l'objet data
            return newItem;
        },

            //delete line
        deleteItem:function(type,id){
            var ids,index,desc,del=''; 
            //il faut passer par un tableau intermédiaire pour ne récupérer que l'id          
            ids = data.allItems[type].map(function(current) {
                return current.id;
            }); 
            // récupération de la decription    
            desc= data.allItems[type].map(function(current) {
                return current.description;
            })[id]; 
                 
            //récupération de l'index de l'id
            index = ids.indexOf(id);            
            if(index !== -1){
                var quest=prompt('effacer la ligne '+desc+' ?\n\tannuler : taper no\n\tou laisser vide');                
             //question supprimer + description
                if(quest!=='no'&&quest!==''&&quest!==null){
                    data.allItems[type].splice(index,1);
                    return true;
                }
                    
            }
            return false;
        },

            //calcul de la balance + et -
        totalBudget:function(){
            //calcul tot depenses entrées
            calculTot('exp');
            calculTot('inc');
            // buget=data.totals['inc']-data.totals['exp'];
            data.budget=data.totals.inc - data.totals.exp;
            if(data.totals.inc>0)
                data.percent=Math.floor((data.totals.exp/data.totals.inc)*100);
                else data.percent=-1;
        },

        calculPercent:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercent:function(){
            // map --> parcourt et renvoie dans un tableau le calcul de %
            var allPerc=data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            //retourne un array
            return allPerc;
        },

        getBudget:function(){
            return{
                budget:data.budget,
                totInc:data.totals.inc,
                totExp:data.totals.exp,
                percent:data.percent
            }
        },
          
        //methode de tests
        testing: function() {
            console.log(data);
        }
    };

})();

var UIController=(function(){
    // objet qui stocke les noms d'objets de dom
    var DomStr={
        addType:'.add__type',
        addDescription:'.add__description',
        addValue:'.add__value',
        addBtn:'.add__btn',  
        incomeContainer:'.income__list',  
        expenseContainer:'.expenses__list',
        addContainer:'.add__container',
        budgetLabel:'.budget__value'  ,
        budgetIncome:'.budget__income--value',
        budgetExpenses:'.budget__expenses--value',
        percentage:'.budget__expenses--percentage',
        expensesPercLabel: '.item__percentage', 
        container:'.container',
        dateLabel:'.budget__title--month',
        addContainer:'.add__container'
        
    }

        var formatNumber = function(num,type){
        var numSplit,dec,int;
        //**+/- selon operation
        //      2 décimales **//
        //      points pour les dixièmes
        ///*****  *******************/
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit=num.split('.');        
        int=numSplit[0];
        if(int.length > 3){
            //ajout d'un espace pour les milliers
            //2000---> length-3 --> 2 000  50000 --> length-3--> 50 000
            int = int.substr(0,int.length - 3) + ' ' + int.substr(int.length - 3 ,3);                    
        }
        dec=numSplit[1];
        return (type=='exp' ? '-' : '+') + ' ' + int + ',' + dec;
    } 

    var nodeListForEach = function(list,callback){
        for(var i=0; i < list.length; i++){
            callback(list[i],i);       
        }
    }

    return{
        //pour rendre publique les entrées et les envoyer au controller
        getInput:function(){
            return{
                type:document.querySelector(DomStr.addType).value,//
                description:document.querySelector(DomStr.addDescription).value,
                val:parseFloat(document.querySelector(DomStr.addValue).value)
            }

        },

        addListItem:function(obj,type){
            var html,newHtml,element;
            if(type==='inc'){
                element=DomStr.incomeContainer;
                html='<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type==='exp'){
                element=DomStr.expenseContainer;
                html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            };

            // remplace le texte %texte% dans les portions html
            newHtml=html.replace('%id%',obj.id);
            newHtml=newHtml.replace('%description%',obj.description);
            newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
            
            //insertAdjacentHTML-->insert dans le dom la chaine html créée beforeend==>dans la balise            
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },

         deleteItem:function(item){
             //on choisit l'élement à supprimer
             var el = document.getElementById(item);
             //on se met au niveau du parent et on supprime l'enfant
             el.parentNode.removeChild(el);
         },

        clearFields:function(){
            var fields, fieldArray;
            fields = document.querySelectorAll(DomStr.addDescription+' , '+ DomStr.addValue);    
            //ici on on appelle la methode slice de Array avec le call
            // car on veut un tableau et le querySelector renvoie une liste...
            fieldArray = Array.prototype.slice.call(fields);

            //en l'occurence nous n'utilisons que la propriété current
            fieldArray.forEach(function(current,index,array){
                current.value="";
            });
                        ///************** */
            //*******une autre façon */
            // fieldArray.forEach(element=> {
            //     element .value="";
            // });
                        ///************** */
            // //*******une autre façon */
            //**** sans utiliser un autre tableau */
            // fields.forEach(element=>{
            //     element.value="";
            // });
            fields[0].focus();

        },

        displayPercent:function(percentages){
            var fields=document.querySelectorAll(DomStr.expensesPercLabel);
            nodeListForEach(fields,function(current,index){               
                if(percentages[index]>0){
                    current.textContent = percentages[index] + ' %';
                } else {current.textContent ='---';}
            })
        },

        displayBudget:function(obj){
            //on accede à budget par Controller qui utilise updateBudget
            document.querySelector(DomStr.budgetLabel).textContent=obj.budget;
            document.querySelector(DomStr.budgetIncome).textContent=obj.totInc;
            document.querySelector(DomStr.budgetExpenses).textContent=obj.totExp;
            if(obj.percent>0){
                document.querySelector(DomStr.percentage).textContent=obj.percent+' %';
            }else document.querySelector(DomStr.percentage).textContent='---';
                

        },        
        displayMonth:function(){
            var months,now , month, year;
            months=['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Décembre'];
            now = new Date();
            month =  months[now.getMonth()];
            year = now.getFullYear();
            document.querySelector(DomStr.dateLabel).textContent = month + ' ' + year;
 
        },
        changeCol:function(ev,type){           
            if(type==='focus')
            ev.target.classList.toggle('focused');               
            else{
                ev.target.classList.remove('focused')
                ev.target.classList.add('unFocused');                
            }
                      
        },

        changeType:function(){
            var fields=document.querySelectorAll(DomStr.addType+','+
            DomStr.addDescription + ',' + DomStr.addValue);
                    //toggle ajoute ou remplace
            fields.forEach(el=>{
                el.classList.toggle('red-focus');
            });
            document.querySelector(DomStr.addBtn).classList.toggle('red');
        },


        //récup de l'objet dom
        getDomStr:function(){
            return DomStr;
        },               
    }

})();

var Controller=(function(budgetCtrl,UiCtrl){

    //pour cloisoner toutes les appels au dom sont dans une fonction privée
    var setupEventListeners=function(){
        var Dom=UIController.getDomStr();
        document.querySelector(Dom.addType).focus();    
        document.querySelector(Dom.addBtn).addEventListener('click',controlAddItem);+

        // document.addEventListener('keyup',function(e){
        //     e.target.onblur=function(){
        //         console.log('loose focus '+e.target);
        //         UiCtrl.changeCol(e.target,'');
        //     };  
        //     e.target.focused=function(){
        //         console.log('focus');
        //         UiCtrl.changeCol(e.target,'focus');            
        //     };               
        // });
        
        document.querySelector(Dom.addType).addEventListener('change',UiCtrl.changeType);

        document.addEventListener('keydown',function(e){              
            document.querySelector(Dom.addContainer).addEventListener('focus',UiCtrl.changeCol);              
        });

        
        document.addEventListener('keypress',function(e){
            if(e.keyCode===13||e.wich===13){             
               //fonction de récup des valeurs de UIController
                controlAddItem();   
            }else{
                if(e.keyCode===45||e.keyCode===43)
                {
                    document.querySelector(Dom.addType).focus();
                }
                   
            }
        })

        
        document.querySelector(Dom.container).addEventListener('click',CtrlDeleteItem);
    }   

    var controlAddItem=function(){ 

        var input,newItem;

              //1-get field input data
             // récup des entrées depuis le UIController
        input=UIController.getInput();

        if(!isNaN(input.val) && input.description!="" && input.val>0){
         //2-add item to the buget controller
            newItem = budgetCtrl.addItem(input.type,input.description,input.val);

                //3-add item to the UI              //appel de la fonction de remplissage de dom                   
            UiCtrl.addListItem(newItem,input.type);
                //4-clear fields
            UiCtrl.clearFields();
            updateBudget();
            //calculate and update percentages
            updatePecentage();
            //
        }


            //5-calcul and update buget
        //{{ --------> sorti vers updateBuget //calcul buget
        //{{ --------> sorti vers updateBuget //display buget UI

    };



    var updateBudget=function(){
        //1-calcul buget
        budgetCtrl.totalBudget();
        //2-return buget
        var budget = budgetCtrl.getBudget();
        //3-display buget on UI
        UiCtrl.displayBudget(budget);

    };

    var updatePecentage=function(){
        //calcul percentages
        budgetCtrl.calculPercent(); 
        //read from budgetctrl
        var percentages=budgetCtrl.getPercent();
        //update ui
        UiCtrl.displayPercent(percentages);
    }

    var CtrlDeleteItem=function(event){
        var desc,itemId,splitId,Id,type;
        //récuperer le parent de target(btn suppr) 
        itemId=event.target.parentNode.parentNode.parentNode.parentNode.id;//a améliorer
        if(itemId){            
            splitId=itemId.split('-');
            type=splitId[0];
            Id=parseInt(splitId[1]);
            // desc=findDesc(Id);
            if(budgetCtrl.deleteItem(type,Id)){
                UiCtrl.deleteItem(itemId);
                updateBudget();
                updatePecentage();
            }
                
        }

       //spliter(split-->crée un tableau avec les éléments récupérés sans
       // le séparateur)
       //ex: si itemId contient inc-id 
        //splitId=itemId.split('-')-- donne--- ['inc','id']

    };
    
    return {  
        //création d'un fonction d'init publique      
        init:function(){
            console.log('app Démarrée.');
            UiCtrl.displayMonth();
            UiCtrl.displayBudget({
                budget:0,
                totInc:0,
                totExp:0,
                percent:-1
            });
         
            setupEventListeners();
        
        }
    }
})

(BudgetController,UIController);
// pour démarrer appel de init 
Controller.init();



