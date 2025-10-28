import useImage from './useImage.js'

const Image = ({ fileName, alt, className, ...rest }) => {
    const { loading, error, image } = useImage(fileName)

    console.log("anything", error)
    if (error) return <div>{alt}</div>

    return (
        <>
            {loading ? (
                <div>loading</div>
            ) : (
                <img
                    className={`Image${
                        className
                            ? className.padStart(className.length + 1)
                            : ''
                    }`}
                    src={image}
                    // src={fileName}
                    alt={alt}
                    {...rest}
                />
            )}
        </>
    )
}

export default Image