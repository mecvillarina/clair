import api, { route } from "@forge/api";

export async function run(event, context) {
	// console.log(event);
	// console.log(context);
    console.log(event);
	console.log(event.eventType);
	console.log(event.issue.id);
    // fetchIssueDetails(event.issue.id).then(issue => {
    //     console.log(issue);
    // });

    console.log(JSON.stringify(event, null, 4));
    
    // const response = await api.asUser().requestJira(route`/rest/api/3/issue/${issueIdOrKey}?fields=summary,description`, {
    //     headers: {
    //       'Accept': 'application/json'
    //     }
    //   });

    // console.log(await response.json());
}

// const fetchIssueDetails = async(issueIdOrKey) => {
//     const res = await requestJira(`/rest/api/3/issue/${issueIdOrKey}?fields=summary,description`);
//     const data = await res.json();
//     console.log(data.fields.summary);
//     console.log(findAllValuesByKey(data, "text"));
//     return { summary: data.fields.summary, descripton: findAllValuesByKey(data, "text").join(" ") };
//   }