

<script>
    export let image;
    export let name; 
    export let origin; 
    export let species; 
    export let status; 
    export let location;

</script>
    
<style>
  .Card {

    width: fit-content;
    display: flex; 
    overflow: hidden;
    background: rgb(60, 62, 68);
    border-radius: 0.5rem;
    margin: 1.80rem;
    margin-left: 4.5rem;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
  }

.card-body{
    width: 35vw;
    display: flex;
    font-family:-apple-system,'BlinkMacSystemFont','Segoe UI','Roboto','Helvetica','Arial',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'
}


  p {
    display: block;
    margin-block-start: 5px;
    margin-block-end: 5px;
    margin-inline-start: 0px;
    margin-inline-end: 0px;
}

  .Card-img {
    width: 30%;
    margin: 0px;
    opacity: 1;
    transition: opacity 0.5s ease 0s;
    object-position: center center;
    object-fit: cover;
}


.Card-description {
  flex: 3 1 0%;
    position: relative;
    padding: 0.75rem;
    color: rgb(255, 255, 255);
    display: flex;
    flex-direction: column;
    width: max-content;
    font-family: "-apple-system", "BlinkMacSystemFont", "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
}

 .Card-description h2 {
  font-size: 1.5rem;
}

span {
    color: rgb(158, 158, 158);
    font-size: 16px;
    font-weight: 500;
}

</style>


<div class="Card">
  <div class="Card-container">  
      <div class="card-body">
        <img class="Card-img" src={image} alt={""} > 
        <div class="Card-description">
          <h2> {name}</h2>  
            <p> <span style={ status === "Alive" ? "color: lightgreen" : status === "Dead"  ? "color: red" : "color:gray"}>{status}</span> - {species} </p>
          <span> Origin: </span>
          <p>{origin.name}</p>
          <span>Location: </span> 
          <p>{location.name} </p>
        </div>
      </div>
  </div>
</div>