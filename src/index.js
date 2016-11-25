import express from 'express';
import cors from 'cors';
import fs from 'fs';

const pokemonsLimit = 20;
const pokemonsOffset = 0;

const pokemonsInfo = JSON.parse(fs.readFileSync('pokemons.json', 'utf-8'));

function sort(a, b, isAscending) {
  if (b === a) {
    return 0;
  }
  if ((b < a && isAscending) || (b > a && !isAscending)) {
    return 1;
  }
  return -1;
}

function sortByName(pokemon1, pokemon2) {
  if (pokemon1.name > pokemon2.name) {
    return 1;
  }
  if (pokemon1.name < pokemon2.name) {
    return -1;
  }
  return 0;
}

function getSortByField(isAscending, field) {
  return (pokemon1, pokemon2) =>
    sort(pokemon1[field], pokemon2[field], isAscending) || sortByName(pokemon1, pokemon2);
}

function getSortByFatness(isAscending) {
  return (pokemon1, pokemon2) => {
    const pokemon1Angular = pokemon1.weight / pokemon1.height;
    const pokemon2Angular = pokemon2.weight / pokemon2.height;

    return sort(pokemon1Angular, pokemon2Angular, isAscending) || sortByName(pokemon1, pokemon2);
  };
}

const sortByRequest = {
  '/': sortByName,
  '/angular': getSortByFatness(true),
  '/fat': getSortByFatness(false),
  '/heavy': getSortByField(false, 'weight'),
  '/light': getSortByField(true, 'weight'),
  '/huge': getSortByField(false, 'height'),
  '/micro': getSortByField(true, 'height'),
};

const app = express();
app.use(cors());
app.use((req, res, next) => {
  let offset = pokemonsOffset;
  let limit = pokemonsLimit;
  if (req.query.limit !== undefined) {
    limit = Number(req.query.limit);
  }

  if (req.query.offset !== undefined) {
    offset = Number(req.query.offset);
  }

  if (sortByRequest[req.path]) {
    res.send(
      pokemonsInfo.sort(sortByRequest[req.path])
        .slice(offset, offset + limit)
        .map(pokemon => pokemon.name)
    );
    next();
  } else {
    res.sendStatus(404);
  }
});

app.listen(3000, () => {
  console.log('Your app listening on port 3000!');
});


/* Попытка работы с сетью, но сайт упал */

// import fetch from 'isomorphic-fetch';
// baseUrl = 'https://pokeapi.co/api/v2';
// const pokemonsUrl = `${baseUrl}/pokemon`;
// async function getInfoFromUrl(url) {
//   const response = await fetch(url);
//   const info = await response.json();
//   return info;
// }
// app.use(async (req, res, next) => {
//   try {
//     const pokemons = await getInfoFromUrl(pokemonsUrl);
//     const pokemonsCount = pokemons.count;
//     for (let i = 1; i < 10; i++) {
//       const pokemon = await getInfoFromUrl(`${pokemonsUrl}/${i}`);
//       pokemonsInfo.push({
//         name: pokemon.name,
//         height: pokemon.height,
//         weight: pokemon.weight,
//       });
//     }
//   } catch (err) {
//     console.error(err.stack);
//   }
//   next();
// });
