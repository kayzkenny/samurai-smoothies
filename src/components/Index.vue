<template>
  <div class="index container">
    <div class="row wrap">
      <div class="col s4" v-for="smoothie in smoothies" :key="smoothie.id">
        <div class="card">
          <div class="card-image">
            <img :src="smoothie.image">
            <span class="card-title">{{ smoothie.title }}</span>
            <span class="btn-floating halfway-fab btn-large pink">
              <router-link :to="{ name : 'EditSmoothie', params: {smoothie_slug: smoothie.slug} }">
                <i class="material-icons">edit</i>
              </router-link>
            </span>
          </div>
          <div class="card-content">
            <ul class="ingredients">
              <li v-for="(ing, index) in smoothie.ingredients" :key="index">
                <span class="chip">{{ ing }}</span>
              </li>
            </ul>
          </div>
          <div class="card-action">
            <button class="pink-text btn-flat waves-effect waves-light" 
              @click="deleteSmoothie(smoothie.id)">DELETE</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {fb, db} from '@/firebase/init'
export default {
  name: 'Index',
  data() {
    return {
      smoothies : []
    }
  },
  methods: {
    deleteSmoothie(id) {
      // delete doc from firestore
      db.collection('smoothies').doc(id).delete().then(() => {
        this.smoothies = this.smoothies.filter(smoothie => {
          return smoothie.id != id
        })
      })
    }
  },
  created() {
    // fetch data from firestore
    db.collection('smoothies').get().then(snapshot => {
      snapshot.forEach(doc => {
        let smoothie = doc.data()
        smoothie.id = doc.id;
        this.smoothies.push(smoothie)
      })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .card-image img {
    max-height: 200px;
    object-fit: cover;
  }
  .index {
    display: grid;
    grid-template-columns: 1fr, 1fr, 1fr;
    grid-gap: 30px;
    margin-top: 60px
  }
  .index .ingredients li {
    display: inline-block;
  }
</style>
