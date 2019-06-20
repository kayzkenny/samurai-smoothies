<template>
  <div class="add-smoothie container">
    <h2 class="center-align indigo-text">Add new smoothie recipe</h2>
    <form @submit.prevent="AddSmoothie">
      <div class="field title">
        <label for="title">Smoothie Title:</label>
        <input type="text" name="title" v-model="title">
      </div>
      <div id="field image">
        <div id="preview">
          <img class="responsive-img" v-if="image" :src="image" />
          <i class="material-icons right close closeImage" @click="deleteImg">close</i>
        </div>
        <button class="btn-small pink" @click="onFilePick" v-if="!image">Add Image</button>
        <input type="file" style="display: none" ref="fileInput" accept="image/*" @change="onFilePicked"/>
      </div>
      <div>
        <ul class="ingredients">
          <li v-for="(ing, index) in ingredients" :key="index">
            <a><span class="chip">
              {{ ing }}<i class="material-icons right close" @click="deleteIng(ing)">close</i>
            </span></a>
          </li>
        </ul>
      </div>
      <div class="title add-ingredient">
        <label for="add-ingredient">Add an ingredient:</label>
        <input type="text" name="add-ingredient" @keydown.enter.prevent="addIng" v-model="another">
      </div>
      <div class="field center-align">
        <p class="red-text" v-if="feedback">{{ feedback }}</p>
        <button class="btn pink">Add Smoothie</button>
      </div>
    </form>
  </div>
</template>

<script>
import {db, fb} from '@/firebase/init'
import slugify from 'slugify'

export default {
  name: 'AddSmoothie',
  data() {
    return {
      title: null,
      image: null,
      another: null,
      feedback: null,
      slug: null,
      imageRef: null,
      ingredients: []
    }
  }, 
  methods: {
    AddSmoothie() {
      if(this.title) {
        this.feedback = null
        // create slug
        this.slug = slugify(this.title, {
          replacement: '-', remove: /[$*_+~,()'"!\-:@]/g,
          lower: true
        });
      } else {
        this.feedback = 'You must enter a title'
      }
      if(this.image) {
        this.feedback = null
      } else {
        this.feedback = 'You must upload an image'
      }
      // only sumit form when all field are valid
      if(this.title && this.image && !this.ingredients.length < 1) {
        db.collection('smoothies').add({
          title: this.title,
          ingredients: this.ingredients,
          slug: this.slug,
          image: this.image
        }).then(() => {
          this.$router.push({ name : 'Index' })
        }).catch(error => {
            console.log(error)
        })
      }   
    },
    onFilePick() {
      this.$refs.fileInput.click()
    },
    onFilePicked(event) {
      let file = event.target.files[0];
      let storageRef = fb.storage().ref('images/' + file.name)
      this.imageRef = storageRef
      console.log(this.imageRef)
      let uploadTask = storageRef.put(file)

      uploadTask.on('state_changed', (snapshot) => {
      }, (error) => {
        // Handle unsuccessful uploads
      }, () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          this.image = downloadURL;
          console.log('File available at', downloadURL);
        });
      });
    },
    addIng() {
      if(this.another) {
        this.ingredients.push(this.another)
        console.log(this.ingredients)
        this.another = null;
        this.feedback = null;
      } else {
        this.feedback = 'You must enter a value to add an ingredient'
      }
    },
    deleteIng(ing) {
      this.ingredients = this.ingredients.filter(ingredient => {
        return ingredient != ing
      })
    },
    deleteImg() {
      this.imageRef.delete().then(() => {
        console.log('File deleted successfully')
      }).catch((error) => {
        console.log(error);
      });
      this.image = null;
    }
  }
}
</script>

<style>
  .add-smoothie {
    margin-top: 60px;
    padding: 20px;
    max-width: 500px;
  }
  .add-smoothie h2 {
    font-size: 2em;
    margin: 20px auto;
  }
  .add-smoothie .field {
    margin: 20px auto;
  }
  .ingredients li {
    display: inline-block;
  }
  #preview {
    display: inline-block;
    position: relative;
  }
  .closeImage {
    position: absolute;
    right: 16px;
    bottom: 16px;
    color: #ffffff;
    font-size: 1.4em;
    cursor: pointer;
  }
</style>