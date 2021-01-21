
<script> 
import Card from './Card.svelte';
export let characters = [];
</script>



    {#each characters as character }
      <Card {...character} />
    {:else}
    <p> Loading...</p>
    {/each}
   
