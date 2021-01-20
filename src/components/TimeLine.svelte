
<script> 
import Card from './Card.svelte';
export let posts = [];
</script>



    {#each posts as post }
      <Card {...post} /> 
    {:else}
    <p> Loading...</p>
    {/each}
   
