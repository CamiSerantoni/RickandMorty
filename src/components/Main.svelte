<script>
  import Footer from "./Footer.svelte"; 
</script>
<style>
   
  .Main {
    grid-template-columns: minmax(auto, 936px);
    justify-content: center;
    background-color: #fafafa;
  }
  .Main-container {
    background: rgb(36, 40, 47);
    display: grid;
    grid-template-columns: 0fr 0fr;
    padding: 1.5rem;
    padding-left: 6%;
    padding-right: 6%;
  }
</style>

<div class="Main">
<div class="Main-container">
  <slot/>
  <Footer/>
</div>
</div>