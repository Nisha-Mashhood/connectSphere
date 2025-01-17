import {Input} from "@nextui-org/react";
import {Textarea} from "@nextui-org/react";
import {Button} from "@nextui-org/react";

const Contact = () => {
  return (
    <div>
        <div className="grid max-w-screen-xl grid-cols-1 gap-8 px-8 py-16 mx-auto rounded-lg md:grid-cols-2 md:px-12 lg:px-16 xl:px-32 dark:bg-gray-100 dark:text-gray-800">
	<div className="flex flex-col justify-between">
		<div className="space-y-2">
			<h2 className="text-4xl font-bold leading-tight lg:text-5xl">Let's talk!</h2>
			<div className="dark:text-gray-600">Share Your feedback and concerns.</div>
		</div>
		<img src="assets/svg/doodle.svg" alt="" className="p-6 h-52 md:h-64" />
	</div>
	<form  className="space-y-6">
		<div>
			<label htmlFor="name" className="text-sm">Full name</label>
			<Input label="Name" type="text" />
		</div>
		<div>
			<label htmlFor="email" className="text-sm">Email</label>
			<Input id="email" label="Email" type="email" />
		</div>
		<div>
			<label htmlFor="message" className="text-sm">Message</label>
			<Textarea className="max-w-xs" id="message" label="message" placeholder="Enter your message" />
		</div>
		<Button type="submit" color="secondary">Send Message</Button>
		{/* <button type="submit" className="w-full p-3 text-sm font-bold tracking-wide uppercase rounded dark:bg-violet-600 dark:text-gray-50">Send Message</button> */}
	</form>
</div>
    </div>
  )
}

export default Contact