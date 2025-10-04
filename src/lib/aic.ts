async function getAIC() {
  try{const res = await fetch("https://api.artic.edu/api/v1/artworks/search?q=cat");
  const json = await res.json();
  console.log(json);
} catch(err){
    console.log(err)
}
}
getAIC();