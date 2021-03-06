// import str from './models/Search';
// //import {add as a, multiply as m,ID} from './views/searchView';
// import * as searchView from './views/searchView';
// console.log(`Using imported function ${searchView.add(searchView.ID,2)} and ${searchView.multiply(3,5)}. ${str}` );

/** Gloabal state of the app
 * -Search object
 * - Current recipe object
 * - Shoping list object
 * - Linked recipes
 */
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import {
    elements,
    renderLoader,
    clearLoader
} from './views/base'
import Likes from './models/Likes';





const state = {};

window.state = state;

/**
 * SEARCH CONTROLER
 */
const controlSearch = async () => {
    // 1) Get query from view 
    //const query = 'pizza';
    const query = searchView.getInput();
    // console.log(query);

    if (query) {
        //2) New search oblect and add to state
        state.search = new Search(query);

        // 3) Prepare UI results 
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);
        // 4) serach for recipes
        try {
            await state.search.getResults();

            // 5) Render results on UI 
            clearLoader();
            searchView.renderResults(state.search.result);

        } catch (err) {
            alert('Something wrong with the search...');
            clearLoader();
        }

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

//Test
// window.addEventListener('load', e => {
//     e.preventDefault();
//     controlSearch();
// });

elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
        console.log(goToPage);
    }
});

/**
 * RECIPE CONTROLER
 */

// const r = new Recipe(47746);
// r.getRecipe();
// console.log(r);

const controlRecipe = async () => {
    //Get Id from url
    const id = window.location.hash.replace('#', '');
    // console.log(id);
    if (id) {
        //Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search item
        if (state.search) searchView.highlightSelected(id)

        ///Create new recipe object 
        state.recipe = new Recipe(id);
        try {
            //Get recipe data and parse ingredients


            // //test
            // window.r = state.recipe;
            //Get recipe data
            await state.recipe.getRecipe();
            // console.log( state.recipe.parseIngredients);
            state.recipe.parseIngredients();
            //Calculate servings anr time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Render recipe
            // console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        } catch (err) {
            alert('Error processing recipe :(');
        }
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load',controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));


/*****
 * List COntroller
 */

const controlList = () => {
    ///Create a new  list IF there in none yet
    if (!state.list) state.list = new List();

    //Add each ingradient to the list an user interface
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

////////////Handle delete and  update  list item events
elements.shopping.addEventListener('click', e =>{
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button
    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        ///delete from state 
        state.list.deleteItem(id);

        ///delete  from UI
        listView.deleteItem(id);
    }else if(e.target.matches('shopping__count-value')){
        const  val = parseFloat(e.target.value, 10);
        state.list.updateCount(id,val)
    }
});

/***
 * Like CONTROLLER
 */
const controlLike = () =>{
    if(!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;

   /// USer has NOt yet liked current recipe
    if(!state.likes.isLiked(currentID)){
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        //togge the like button


       // Add like to UI list 
       console.log(state.likes);


 /// USer has  liked current recipe
    }else{
        //Remuve like from the state
        state.likes.deleteLike(currentID)
        //togge the like button


       // Remuve like from UI list 
       console.log(state.likes);
    }

};



///Handing recipe button \clicks 
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease,.btn-decrease *')) {
        //decrrease button is clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }

    } else if (e.target.matches('.btn-increase,.btn-increase *')) {
        //increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add,.recipe__btn--add *')) {
        ///Add ingredients to shopping list
        controlList();
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        //Like controller
        controlLike();
    }

});

window.l = new List();