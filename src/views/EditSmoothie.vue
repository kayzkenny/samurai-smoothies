<template>
    <div class="edit-smoothie container" v-if="smoothie">
        <h2>Edit {{ smoothie.title }} Smoothie</h2>
        <form @submit.prevent="EditSmoothie">
            <div class="field title">
                <label for="title">Smoothie Title:</label>
                <input type="text" name="title" v-model="smoothie.title">
            </div>
            <div id="field image">
                <div id="preview">
                <img class="responsive-img" v-if="smoothie.image" :src="smoothie.image" />
                <i class="material-icons right close closeImage" @click="deleteImg">close</i>
                </div>
                <button class="btn-small pink" @click="onFilePick" v-if="!smoothie.image">Add Image</button>
                <input type="file" style="display: none" ref="fileInput" accept="image/*" @change="onFilePicked"/>
            </div>
            <div>
                <ul class="ingredients">
                <li v-for="(ing, index) in smoothie.ingredients" :key="index">
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
                <button class="btn pink">Update Smoothie</button>
            </div>
        </form>
    </div>
</template>

<script>
import {db, fb} from '@/firebase/init'
import slugify from 'slugify'
export default {
    name: 'EditSmoothie',
    data() {
        return {
            smoothie: null,
            another: null,
            feedback: null,
            imageRef: null
        }
    },
    methods: {
        EditSmoothie() {
            if(this.smoothie.title) {
                this.feedback = null
                // create slug
                this.smoothie.slug = slugify(this.smoothie.title, {
                    replacement: '-', remove: /[$*_+~,()'"!\-:@]/g,
                    lower: true
                });
            } else {
                this.feedback = 'You must enter a title'
            }
            if(this.smoothie.image) {
                this.feedback = null
            } else {
                this.feedback = 'You must upload an image'
            }
            // only sumit form when all field are valid
            if(this.smoothie.title && this.smoothie.image && !this.smoothie.ingredients.length < 1) {
                db.collection('smoothies').doc(this.smoothie.id).update({
                    title: this.smoothie.title,
                    ingredients: this.smoothie.ingredients,
                    slug: this.smoothie.slug,
                    image: this.smoothie.image
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
            this.imageRef = storageRef;
            let uploadTask = storageRef.put(file)

            uploadTask.on('state_changed', (snapshot) => {
            }, (error) => {
             // Handle unsuccessful uploads
            }, () => {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                this.smoothie.image = downloadURL;
                console.log('File available at', downloadURL);
                });
            });
        },
        addIng() {
            if(this.another) {
                this.smoothie.ingredients.push(this.another)
                this.another = null;
                this.feedback = null;
            } else {
                this.feedback = 'You must enter a value to add an ingredient'
            }
        },
        deleteIng(ing) {
            this.smoothie.ingredients = this.smoothie.ingredients.filter(ingredient => {
                return ingredient != ing
            })
        },
        deleteImg() {
            let image = fb.storage().refFromURL(this.smoothie.image);
            image.delete().then(() => {
                console.log('File deleted successfully')
            }).catch((error) => {
                console.log(error)
            });
            this.smoothie.image = null;
        }
    },
    created() {
        let ref = db.collection('smoothies').where('slug', '==', this.$route.params.smoothie_slug)
        ref.get().then(snapshot => {
            snapshot.forEach(doc => {
                this.smoothie = doc.data()
                this.smoothie.id = doc.id
            })
        })
    },
}
</script>

<style>
.edit-smoothie {
    margin-top: 60px;
    padding: 20px;
    max-width: 500px;
}
.edit-smoothie h2 {
    font-size: 2em;
    margin: 20px auto;
}
.edit-smoothie .field {
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
