
<script>
import axios from "axios";

export default {
  name: "EditFeedback",
  data() {
    return {
      feedbackId: null,
      name: "",
      comment: "",
    };
  },
  created() {

  },
  methods: {
    updateFeedback() {
      const feedbackData = {
        name: this.name,
        comment: this.comment,
      };

      axios
          .put(`http://localhost:8080/feedback/update/${this.feedbackId}`, feedbackData)
          .then(response => {
            console.log(response.data);
          })
          .catch(error => {
            console.error(error);
          });
    },
  },
};
</script>
